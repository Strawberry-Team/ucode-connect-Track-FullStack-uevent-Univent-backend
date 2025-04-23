// prisma/seeds/orders.ts
import { faker } from '@faker-js/faker';
import { PaymentMethod, TicketStatus } from '@prisma/client';
import { SEEDS } from './seed-constants';
import { CreateOrderDto } from '../../src/models/orders/dto/create-order.dto';
import { CreateOrderItemDto } from '../../src/models/orders/order-items/dto/create-order-item.dto';
import {PromoCodesService} from "../../src/models/promo-codes/promo-codes.service";

export async function initialOrders(db: any, ordersService: any, promoCodesService: PromoCodesService) {
    for (let i = 0; i < SEEDS.ORDERS.TOTAL; i++) {
        let userId: number = i == 0 ? 2 : faker.number.int({ min: 1, max: SEEDS.USERS.TOTAL });

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

        let promoCode = faker.helpers.maybe(
            () => faker.helpers.arrayElement(SEEDS.PROMO_CODES.CODES),
            { probability: i == 2 ? 1 : SEEDS.ORDERS.DISCOUNT_PROBABILITY },
        );

        if (promoCode){
            promoCode = promoCode + `_EVENT${eventId}`
            const res = await promoCodesService.isValidPromoCode({eventId, code: promoCode});
            if(!res){

                promoCode = undefined;
            }
        }
        const orderDto: CreateOrderDto = {
            eventId,
            ...(promoCode && { promoCode }),
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
