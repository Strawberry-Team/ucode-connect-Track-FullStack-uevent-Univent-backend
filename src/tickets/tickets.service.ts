// src/tickets/tickets.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private readonly ticketsRepository: TicketsRepository) {}

    async create(
        createTicketDto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        // const existingEvent = await this.eventRepository.findById(//TODO: implement this when eventRepository will be done
        //     createTicketDto.eventId,
        // );
        //
        // if(!existingEvent) {
        //     throw new NotFoundException(`Event with id ${createTicketDto.eventId} does not exist`);
        // }

        const existingTicket = await this.ticketsRepository.findByNumber(
            createTicketDto.number,
        );

        if (existingTicket) {
            throw new ConflictException(
                `A ticket with the number ${createTicketDto.number} already exists`,
            );
        }

        // createTicketDto.price = new Prisma.Decimal(createTicketDto.price.toString());

        return this.ticketsRepository.create(createTicketDto);
    }

    async findAll(params?: {
        eventId?: number;
        title?: string;
        status?: TicketStatus;
    }): Promise<{
        items: Ticket[];
        total: number;
    }> {
        const { eventId, title, status } = params || {};

        // const existingEvent = await this.eventRepository.findById(//TODO: implement this when eventRepository will be done
        //     createTicketDto.eventId,
        // );
        //
        // if(!existingEvent) {
        //     throw new NotFoundException(`Event with id ${createTicketDto.eventId} does not exist`);
        // }

        const [items, total] = await Promise.all([
            this.ticketsRepository.findAll({
                eventId,
                title,
                status,
            }),
            this.ticketsRepository.count({ eventId, title, status }),
        ]);

        if (!items) {
            throw new NotFoundException('Tickets not found');
        }

        return { items, total };
    }

    async findOne(id: number, userId?: number): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return ticket;
    }

    async update(
        id: number,
        updateTicketDto: UpdateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const ticket = await this.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return this.ticketsRepository.update(id, updateTicketDto);
    }

    async remove(id: number, userId: number): Promise<void> {
        const ticket = await this.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        await this.ticketsRepository.remove(id);
    }
}
