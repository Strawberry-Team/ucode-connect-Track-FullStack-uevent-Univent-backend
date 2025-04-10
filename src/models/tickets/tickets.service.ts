// src/models/tickets/tickets.service.ts
import {
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

@Injectable()
export class TicketsService {
    constructor(private readonly ticketsRepository: TicketsRepository) {}

    async createTicket(
        createTicketDto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const existingTicket = await this.ticketsRepository.findOneByNumber(
            createTicketDto.number,
        );
        if (existingTicket) {
            throw new ConflictException(
                `A ticket with the number ${createTicketDto.number} already exists`,
            );
        }

        const ticket = await this.ticketsRepository.create(createTicketDto);

        return plainToInstance(Ticket, ticket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
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

    async findOneTicket(id: number, userId?: number): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne(id);
        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return plainToInstance(Ticket, ticket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateTicket(
        id: number,
        updateTicketDto: UpdateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const ticket = await this.findOneTicket(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        const updatedTicket = await this.ticketsRepository.update(
            id,
            updateTicketDto,
        );
        return plainToInstance(Ticket, updatedTicket, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async deleteTicket(id: number, userId: number): Promise<void> {
        const ticket = await this.findOneTicket(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        await this.ticketsRepository.delete(ticket.id);
    }
}
