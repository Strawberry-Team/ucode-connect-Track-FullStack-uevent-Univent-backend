// src/models/tickets/tickets.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Ticket } from './entities/ticket.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsRepository {
    constructor(private db: DatabaseService) {}

    async create(createTicketDto: CreateTicketDto & { number: string, eventId: number}): Promise<Ticket> {
        const result = await this.db.ticket.create({
            data: {
                eventId: createTicketDto.eventId,
                title: createTicketDto.title,
                number: createTicketDto.number,
                price: createTicketDto.price,
                status: createTicketDto.status,
            },
        });

        const { price, ...ticketWithoutPrice } = result;
        return { ...ticketWithoutPrice, price: Number(price) };
    }

    async findAll(params?: {
        eventId?: number;
        title?: string;
        status?: TicketStatus;
    }): Promise<Ticket[]> {
        const { eventId, title, status } = params || {};

        const result = await this.db.ticket.findMany({
            where: {
                ...(eventId && { eventId }),
                ...(status && { status }),
                ...(title && { title }),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const finalResult: Ticket[] = [];

        result.forEach((ticket) => {
            const { price, ...ticketWithoutPrice } = ticket;
            const result = { ...ticketWithoutPrice, price: Number(price) };
            finalResult.push(result);
        });

        return finalResult;
    }

    async findById(id: number): Promise<Ticket | null> {
        const ticket = await this.db.ticket.findUnique({
            where: { id },
        });

        if (!ticket) {
            return null;
        }

        const { price, ...ticketWithoutPrice } = ticket;
        return { ...ticketWithoutPrice, price: Number(price) };
    }

    async findByNumber(number: string): Promise<Ticket | null> {
        const ticket = await this.db.ticket.findUnique({
            where: { number },
        });

        if (!ticket) {
            return null;
        }

        const { price, ...ticketWithoutPrice } = ticket;
        return { ...ticketWithoutPrice, price: Number(price) };
    }

    async count(params?: {
        eventId?: number;
        title?: string;
        status?: TicketStatus;
    }): Promise<number> {
        const { eventId, title, status } = params || {};

        return this.db.ticket.count({
            where: {
                ...(eventId && { eventId }),
                ...(title && { title }),
                ...(status && { status }),
            },
        });
    }

    async update(
        id: number,
        updateTicketDto: UpdateTicketDto,
    ): Promise<Ticket> {
        const ticket = await this.db.ticket.update({
            where: { id },
            data: {
                ...updateTicketDto,
                price: updateTicketDto.price
                    ? new Prisma.Decimal(updateTicketDto.price)
                    : undefined,
            },
        });

        const { price, ...ticketWithoutPrice } = ticket;
        return { ...ticketWithoutPrice, price: Number(price) };
    }

    async delete(id: number): Promise<void> {
        this.db.ticket.delete({
            where: { id },
        });
    }
}
