// src/models/tickets/tickets.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { SERIALIZATION_GROUPS, Ticket } from './entities/ticket.entity';
import { TicketStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {EventsRepository} from "../events/events.repository";

@Injectable()
export class TicketsService {
    constructor(private readonly ticketsRepository: TicketsRepository,
                private readonly eventsRepository: EventsRepository ) {}

    async createTicket(
        createTicketDto: CreateTicketDto,
        eventId: number,
    ): Promise<Ticket> {
        const ticketNumber = this.generateTicketNumber(eventId);
        const existingTicket = await this.ticketsRepository.findByNumber(
            ticketNumber
        );
        if (existingTicket) {
            throw new ConflictException(
                `A ticket with the number ${ticketNumber} already exists`,
            );
        }

        if(!createTicketDto.status){
            createTicketDto.status = TicketStatus.UNAVAILABLE;
        }

        const ticketData = {
            ...createTicketDto,
            number: ticketNumber,
            eventId: eventId,
        };

        const ticket = await this.ticketsRepository.create(ticketData);

        return plainToInstance(Ticket, ticket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async createTickets(
        createTicketDto: CreateTicketDto,
        eventId?: number,
    ): Promise<Ticket[]> {
        const tickets: Ticket[] = [];

        if(!createTicketDto.quantity) createTicketDto.quantity = 1;

        if(!eventId) throw new ConflictException('You must provide an eventId');

        const event = await this.eventsRepository.findById(eventId)

        if(!event){
            throw new NotFoundException(`Event ${eventId} does not exist`);
        }

        for (let i = 0; i < Number(createTicketDto.quantity); i++) {
            tickets.push(await this.createTicket(createTicketDto, eventId));
        }

        return tickets;
    }


    async findAllTickets(params?: {
        eventId?: number;
        title?: string;
        status?: TicketStatus;
    }): Promise<{
        items: Ticket[];
        total: number;
    }> {
        const { eventId, title, status } = params || {};

        const [items, total] = await Promise.all([
            this.ticketsRepository.findAll({ eventId, title, status }),
            this.ticketsRepository.count({ eventId, title, status }),
        ]);

        const ticketItems = plainToInstance(
            Ticket,
            items.map((item) => item),
            { groups: SERIALIZATION_GROUPS.BASIC },
        );

        return { items: ticketItems, total };
    }

    async findOneTicket(id: number, eventId?: number): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findById(id);

        if(eventId && ticket?.eventId && ticket?.eventId !== eventId) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return plainToInstance(Ticket, ticket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateTicket(
        id: number,
        updateTicketDto: UpdateTicketDto
    ): Promise<Ticket> {
        const ticket = await this.findOneTicket(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        if (ticket.status == TicketStatus.SOLD || ticket.status == TicketStatus.RESERVED) {
            throw new BadRequestException(`Sold or reserved tickets cannot be updated`);
        }

        const updatedTicket = await this.ticketsRepository.update(
            id,
            updateTicketDto,
        );
        return plainToInstance(Ticket, updatedTicket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async deleteTicket(id: number): Promise<void> {
        const ticket = await this.findOneTicket(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        await this.ticketsRepository.delete(ticket.id);
    }

    generateTicketNumber(eventId: number): string {//TODO: Then decide how to properly generate the yicket number
        return `TICKET-${eventId}-${new Date().getTime()}`;
    }
}
