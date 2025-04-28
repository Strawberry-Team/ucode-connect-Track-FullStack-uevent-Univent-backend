// src/models/orders/orders-items.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderItemsRepository {
    constructor(private readonly db: DatabaseService) {}

    async createMany(
        data: Prisma.OrderItemCreateManyInput[],
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.BatchPayload> {
        const prismaClient = tx || this.db;
        return prismaClient.orderItem.createMany({
            data,
        });
    }

    async update(
        id: number,
        data: Prisma.OrderItemUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.OrderItemGetPayload<{ include: { ticket: { include: { event: true } } } }>> {
        const prismaClient = tx || this.db;

        return prismaClient.orderItem.update({
            where: { id },
            data,
            include: { ticket: { include: { event: true } } },
        });
    }

    async findByOrderId(
        orderId: number
    ): Promise<Prisma.OrderItemGetPayload<{}>[]> {
        return this.db.orderItem.findMany({
            where: { orderId },
        });
    }

    async findByTicketFileKey(
        ticketFileKey: string
    ): Promise<Prisma.OrderItemGetPayload<{include: {
            order: true,
        }}> | null> {
        return this.db.orderItem.findUnique({
            where: { ticketFileKey },
            include: {
                order: true,
            },
        });
    }

    async deleteByOrderId(orderId: number): Promise<Prisma.BatchPayload> {
        return this.db.orderItem.deleteMany({
            where: { orderId },
        });
    }

    async findMany(
        orderId: number,
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.OrderItemGetPayload<{ select: { ticketId: true } }>[]> {
        const prismaClient = tx || this.db;

        return prismaClient.orderItem.findMany({
            where: { orderId },
            select: { ticketId: true },
        });
    }
}
