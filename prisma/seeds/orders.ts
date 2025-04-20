// prisma/seeds/orders.ts
import { faker } from '@faker-js/faker';
import { PaymentMethod, TicketStatus } from '@prisma/client';
import { SEEDS } from './seed-constants';
import { CreateOrderDto } from '../../src/models/orders/dto/create-order.dto';
import { CreateOrderItemDto } from '../../src/models/orders/order-items/dto/create-order-item.dto';

export async function seedOrders(db: any, ordersService: any) {
    for (let i = 0; i < SEEDS.ORDERS.TOTAL; i++) {
        const userId = faker.number.int({ min: 1, max: SEEDS.USERS.TOTAL });
        const eventId = faker.number.int({ min: 1, max: SEEDS.EVENTS.TOTAL });

        const availableTickets = await db.ticket.findMany({
            where: {
                eventId: eventId,
                status: TicketStatus.AVAILABLE,
            },
            select: {
                id: true,
                title: true,
            },
            distinct: ['title'],
        });

        if (availableTickets.length === 0) continue;

        const items: CreateOrderItemDto[] = [];
        for (const ticket of availableTickets) {
            const count = await db.ticket.count({
                where: {
                    eventId: eventId,
                    title: ticket.title,
                    status: TicketStatus.AVAILABLE,
                },
            });

            if (count > 0) {
                const quantity = faker.number.int({ min: 1, max: Math.min(3, count) });
                items.push({
                    ticketTitle: ticket.title,
                    quantity,
                });
            }
        }

        if (items.length === 0) continue;

        const promoCodeId = faker.helpers.maybe(
            () => faker.number.int({ min: 1, max: SEEDS.PROMO_CODES.CODES.length }),
            { probability: SEEDS.ORDERS.DISCOUNT_PROBABILITY }
        );

        const orderDto: CreateOrderDto = {
            eventId,
            promoCodeId,
            paymentMethod: PaymentMethod.STRIPE,
            items,
        };

        try {
            await ordersService.create(orderDto, userId);
        } catch (error) {
            console.error(`Failed to create order: ${error.message}`);
        }
    }
}
