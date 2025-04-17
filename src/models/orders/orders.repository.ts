// src/models/orders/orders.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Prisma,
         PaymentStatus,
         PaymentMethod,
} from '@prisma/client';
import {CreateOrderDto} from "./dto/create-order.dto";


@Injectable()
export class OrdersRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(
        createOrderDto: CreateOrderDto & {
            userId: number;
            totalAmount: Prisma.Decimal;
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

    async findById(id: number): Promise<Prisma.OrderGetPayload<{
        include: { orderItems: true };
    }> | null> {
        return this.db.order.findUnique({
            where: { id },
            include: { orderItems: true },
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
    ): Promise<Prisma.OrderGetPayload<{ include: { orderItems: true } }>> {
        return this.db.order.update({
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
}
