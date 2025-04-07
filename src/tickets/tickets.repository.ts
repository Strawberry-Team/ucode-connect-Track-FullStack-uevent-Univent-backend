// src/tickets/tickets.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsRepository {
    constructor(private db: DatabaseService) {}

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        return this.db.ticket.create({
            data: {
                eventId: createTicketDto.eventId,
                title: createTicketDto.title,
                number: createTicketDto.number,
                price: createTicketDto.price,
                status: createTicketDto.status,
            },
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        eventId?: number;
        status?: TicketStatus;
    }): Promise<Ticket[]> {
        const { skip, take, eventId, status } = params || {};

        return this.db.ticket.findMany({
            skip,
            take,
            where: {
                ...(eventId && { eventId }),
                ...(status && { status }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: number): Promise<Ticket | null> {
        return this.db.ticket.findUnique({
            where: { id },
        });
    }

    async findByNumber(number: string): Promise<Ticket | null> {
        return this.db.ticket.findUnique({
            where: { number },
        });
    }

    async update(
        id: number,
        updateTicketDto: UpdateTicketDto,
    ): Promise<Ticket> {
        return this.db.ticket.update({
            where: { id },
            data: updateTicketDto,
        });
    }

    async remove(id: number): Promise<Ticket> {
        return this.db.ticket.delete({
            where: { id },
        });
    }

    async count(params?: {
        eventId?: number;
        status?: TicketStatus;
    }): Promise<number> {
        const { eventId, status } = params || {};

        return this.db.ticket.count({
            where: {
                ...(eventId && { eventId }),
                ...(status && { status }),
            },
        });
    }
}
