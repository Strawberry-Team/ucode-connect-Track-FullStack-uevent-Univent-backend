// src/models/tickets/tickets.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Ticket } from './entities/ticket.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

interface TicketSearchParams {
    eventId?: number;
    title?: string;
    status?: TicketStatus;
    limit?: number;
}

interface TicketTypeSearchParams {
    eventId?: number;
}

type PrismaClientOrTx = DatabaseService | Prisma.TransactionClient;

const DEFAULT_TICKET_INCLUDE = {
    event: false,
} as const;

const TICKET_ORDER_BY = {
    price: 'asc' as const,
} satisfies Prisma.TicketOrderByWithRelationInput;

@Injectable()
export class TicketsRepository {
    constructor(private readonly db: DatabaseService) {}

    private buildWhereClause(params?: TicketSearchParams): Prisma.TicketWhereInput {
        const { eventId, title, status } = params || {};
        return {
            ...(eventId && { eventId }),
            ...(status && { status }),
            ...(title && { title }),
        };
    }

    private transformTicketData<T extends { price: Prisma.Decimal }>(ticket: T): Omit<T, 'price'> & { price: number } {
        const { price, ...rest } = ticket;
        return {
            ...rest,
            price: Number(price),
        };
    }

    private getPrismaClient(tx?: PrismaClientOrTx): PrismaClientOrTx {
        return tx || this.db;
    }

    async create(createTicketDto: CreateTicketDto & { number: string; eventId: number }): Promise<Ticket> {
        const result = await this.db.ticket.create({
            data: {
                eventId: createTicketDto.eventId,
                title: createTicketDto.title,
                number: createTicketDto.number,
                price: createTicketDto.price,
                status: createTicketDto.status,
            },
            include: DEFAULT_TICKET_INCLUDE,
        });

        return this.transformTicketData(result);
    }

    async findAll(params?: TicketSearchParams, tx?: PrismaClientOrTx): Promise<Ticket[]> {
        const prismaClient = this.getPrismaClient(tx);
        const where = this.buildWhereClause(params);

        const result = await prismaClient.ticket.findMany({
            where,
            take: params?.limit,
            include: DEFAULT_TICKET_INCLUDE,
            orderBy: TICKET_ORDER_BY,
        });

        return result.map(ticket => this.transformTicketData(ticket));
    }

    async findAllTicketTypes(
        params?: TicketTypeSearchParams,
        tx?: PrismaClientOrTx
    ): Promise<{ items: { title: string; price: number; count: number }[]; total: number }> {
        const prismaClient = this.getPrismaClient(tx);

        const groupedTickets = await prismaClient.ticket.groupBy({
            by: ['title', 'price'],
            where: {
                ...(params?.eventId && { eventId: params.eventId }),
                status: TicketStatus.AVAILABLE,
            },
            _count: {
                _all: true,
            },
            orderBy: TICKET_ORDER_BY,
        });

        const items = groupedTickets.map(group => ({
            title: group.title,
            price: Number(group.price),
            count: group._count._all
        }));

        return {
            items,
            total: items.length
        };
    }

    async reserveTickets(ticketIds: number[], tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
        return tx.ticket.updateMany({
            where: {
                id: { in: ticketIds },
                status: TicketStatus.AVAILABLE,
            },
            data: {
                status: TicketStatus.RESERVED,
            },
        });
    }

    async releaseTickets(ticketIds: number[], tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
        return tx.ticket.updateMany({
            where: {
                id: { in: ticketIds },
                status: TicketStatus.RESERVED,
            },
            data: {
                status: TicketStatus.AVAILABLE,
            },
        });
    }

    async updateTicketStatus(
        ticketIds: number[],
        status: TicketStatus,
        currentStatus?: TicketStatus, // Опциональная проверка текущего статуса
        tx: Prisma.TransactionClient,
    ): Promise<Prisma.BatchPayload> {
        const whereClause: Prisma.TicketWhereInput = {
            id: { in: ticketIds },
        };

        // Добавляем проверку текущего статуса, если передан
        if (currentStatus) {
            whereClause.status = currentStatus;
        }

        return tx.ticket.updateMany({
            where: whereClause,
            data: {
                status,
            },
        });
    }

    async findById(id: number, tx?: PrismaClientOrTx): Promise<Ticket | null> {
        const prismaClient = this.getPrismaClient(tx);
        const ticket = await prismaClient.ticket.findUnique({
            where: { id },
            include: DEFAULT_TICKET_INCLUDE,
        });

        return ticket ? this.transformTicketData(ticket) : null;
    }

    async findByNumber(number: string, tx?: PrismaClientOrTx): Promise<Ticket | null> {
        const prismaClient = this.getPrismaClient(tx);
        const ticket = await prismaClient.ticket.findUnique({
            where: { number },
            include: DEFAULT_TICKET_INCLUDE,
        });

        return ticket ? this.transformTicketData(ticket) : null;
    }

    async count(params?: TicketSearchParams, tx?: PrismaClientOrTx): Promise<number> {
        const prismaClient = this.getPrismaClient(tx);
        const where = this.buildWhereClause(params);

        return prismaClient.ticket.count({ where });
    }

    async update(
        id: number,
        updateTicketDto: UpdateTicketDto,
        tx?: PrismaClientOrTx,
    ): Promise<Ticket> {
        const prismaClient = this.getPrismaClient(tx);

        const ticket = await prismaClient.ticket.update({
            where: { id },
            data: {
                ...updateTicketDto,
                price: updateTicketDto.price
                    ? new Prisma.Decimal(updateTicketDto.price)
                    : undefined,
            },
            include: DEFAULT_TICKET_INCLUDE,
        });

        return this.transformTicketData(ticket);
    }

    async delete(id: number, tx?: PrismaClientOrTx): Promise<void> {
        const prismaClient = this.getPrismaClient(tx);
        await prismaClient.ticket.delete({
            where: { id },
        });
    }
}
