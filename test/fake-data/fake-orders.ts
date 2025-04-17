// test/fake-data/fake-orders.ts
import { PaymentMethod, TicketStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from '../../src/models/orders/dto/create-order.dto';
import { Order } from '../../src/models/orders/entities/order.entity';
import { CreateOrderItemDto } from '../../src/models/orders/order-items/dto/create-order-item.dto';
import { Ticket } from '../../src/models/tickets/entities/ticket.entity';

export function generateFakeCreateOrderItemDto(
    overrides: Partial<CreateOrderItemDto> = {},
): CreateOrderItemDto {
    return {
        ticketTitle: overrides.ticketTitle || 'Standard Ticket',
        quantity: overrides.quantity || 2,
    };
}

export function generateFakeCreateOrderDto(
    overrides: Partial<CreateOrderDto> = {},
): CreateOrderDto {
    return {
        eventId: overrides.eventId || 1,
        promoCodeId: overrides.promoCodeId ?? null,
        paymentMethod: overrides.paymentMethod || PaymentMethod.STRIPE,
        items: overrides.items || [generateFakeCreateOrderItemDto()],
    };
}

export function generateFakeTicket(
    overrides: Partial<Ticket> = {},
): Ticket {
    return {
        id: overrides.id || 1,
        eventId: overrides.eventId || 1,
        title: overrides.title || 'Standard Ticket',
        number: overrides.number || `TICKET-1-${Date.now()}`,
        price: overrides.price || 100,
        status: overrides.status || TicketStatus.AVAILABLE,
        createdAt: overrides.createdAt || new Date(),
        updatedAt: overrides.updatedAt || new Date(),
    };
}

export function generateFakeOrderItem(orderId: number = 1, ticketId: number = 1) {
    return {
        id: Math.floor(Math.random() * 1000) + 1,
        orderId,
        ticketId,
        initialPrice: new Prisma.Decimal(100),
        finalPrice: new Prisma.Decimal(100),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export function generateFakeOrder(
    overrides: Partial<Order> = {},
    includeItems: boolean = false,
): Order {
    const orderId = overrides.id || 1;

    const order: Order = {
        id: orderId,
        userId: overrides.userId || 1,
        paymentStatus:  overrides.paymentStatus || 'PENDING',
        promoCodeId: overrides.promoCodeId || null,
        paymentMethod: overrides.paymentMethod || PaymentMethod.STRIPE,
        totalAmount: overrides.totalAmount || 200,
        createdAt: overrides.createdAt || new Date(),
        updatedAt: overrides.updatedAt || new Date(),
    };

    if (includeItems) {
        order.items = [
            generateFakeOrderItem(orderId, 1),
            generateFakeOrderItem(orderId, 2),
        ].map(item => ({
            ...item,
            initialPrice: Number(item.initialPrice),
            finalPrice: Number(item.finalPrice),
        }));
    }

    return order;
}

export function generateFakeDbOrder(
    overrides: Partial<any> = {},
): any {
    const orderId = overrides.id || 1;

    return {
        id: orderId,
        userId: overrides.userId || 1,
        eventId: overrides.eventId || 1,
        promoCodeId: overrides.promoCodeId || null,
        paymentMethod: overrides.paymentMethod || PaymentMethod.STRIPE,
        totalAmount: new Prisma.Decimal(overrides.totalAmount || 200),
        createdAt: overrides.createdAt || new Date(),
        updatedAt: overrides.updatedAt || new Date(),
        orderItems: overrides.orderItems || [
            generateFakeOrderItem(orderId, 1),
            generateFakeOrderItem(orderId, 2),
        ],
    };
}
