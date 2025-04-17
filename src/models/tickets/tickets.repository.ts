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

    async create(createTicketDto: CreateTicketDto & { number: string, eventId}): Promise<Ticket> {
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
                      limit?: number;
                  },
                  tx?: Prisma.TransactionClient
    ): Promise<Ticket[]> {
        const {eventId, title, status} = params || {};
        const prismaClient = tx || this.db;

        const result = await prismaClient.ticket.findMany({
            where: {
                ...(eventId && { eventId }),
                ...(status && { status }),
                ...(title && { title }),
            },
            take: params?.limit,
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

    async reserveTickets(
        ticketIds: number[],
        tx: Prisma.TransactionClient, // Обов'язковий tx
    ): Promise<Prisma.BatchPayload> {
        return tx.ticket.updateMany({
            where: {
                id: { in: ticketIds },
                status: TicketStatus.AVAILABLE, // Перевіряємо, що вони все ще доступні
            },
            data: {
                status: TicketStatus.RESERVED,
            },
        });
    }

    async releaseTickets(
        ticketIds: number[],
        tx: Prisma.TransactionClient, // Обов'язковий tx
    ): Promise<Prisma.BatchPayload> {
        return tx.ticket.updateMany({
            where: {
                id: { in: ticketIds },
                // Можна додати перевірку status: TicketStatus.RESERVED
            },
            data: {
                status: TicketStatus.AVAILABLE,
            },
        });
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
                },
                tx?: Prisma.TransactionClient): Promise<number> {
        const { eventId, title, status } = params || {};
        const prismaClient = tx || this.db;

        return prismaClient.ticket.count({
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
        tx?: Prisma.TransactionClient,
    ): Promise<Ticket> {
        const prismaClient = tx || this.db;
        const ticket = await prismaClient.ticket.update({
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
