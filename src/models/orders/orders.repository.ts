// src/models/orders/orders.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Order, PaymentStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

const orderWithDetailsSelect = {
    id: true,
    userId: true,
    totalAmount: true,
    paymentStatus: true,
    paymentMethod: true,
    createdAt: true,
    promoCode: {
        select: {
            discountPercent: true,
        },
    },
    orderItems: {
        select: {
            id: true,
            finalPrice: true,
            ticketFileKey: true,
            ticket: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    number: true,
                    event: {
                        select: {
                            id: true,
                            title: true,
                            startedAt: true,
                            endedAt: true,
                            venue: true,
                            posterName: true,
                        },
                    },
                },
            },
        },
    },
} as const;

export type OrderWithDetails = Prisma.OrderGetPayload<{
    select: typeof orderWithDetailsSelect;
}>;

@Injectable()
export class OrdersRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(
        createOrderDto: CreateOrderDto & {
            userId: number;
            totalAmount: Prisma.Decimal;
            promoCodeId?: number;
        },
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.OrderGetPayload<{ include: { orderItems: true } }>> {
        const prismaClient = tx || this.db;

        return prismaClient.order.create({
            data: {
                userId: createOrderDto.userId,
                promoCodeId: createOrderDto.promoCodeId,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: createOrderDto.paymentMethod,
                totalAmount: createOrderDto.totalAmount,
            },
            include: { orderItems: true },
        });
    }

    async findById(
        id: number,
        tx?: Prisma.TransactionClient,
    ): Promise<OrderWithDetails | null> {
        const prismaClient = tx || this.db;

        return prismaClient.order.findUnique({
            where: { id },
            select: orderWithDetailsSelect,
        });
    }

    async findAllWithDetailsByUserId(
        userId: number,
    ): Promise<OrderWithDetails[]> {
        return this.db.order.findMany({
            where: { userId },
            select: orderWithDetailsSelect,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMany(
        where: Prisma.OrderWhereInput,
        skip: number,
        take: number,
    ): Promise<Prisma.OrderGetPayload<{ include: { orderItems: true } }>[]> {
        return this.db.order.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { orderItems: true },
        });
    }

    async count(where: Prisma.OrderWhereInput): Promise<number> {
        return this.db.order.count({ where });
    }

    async update(
        id: number,
        data: Prisma.OrderUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<Prisma.OrderGetPayload<{ include: { orderItems: true } }>> {
        const prismaClient = tx || this.db;

        return prismaClient.order.update({
            where: { id },
            data,
            include: { orderItems: true },
        });
    }

    // async delete(id: number): Promise<Prisma.Order> {
    //     return this.db.orders.delete({
    //         where: { id },
    //     });
    // }

    async findAll(): Promise<Order[]> {
        return this.db.order.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
