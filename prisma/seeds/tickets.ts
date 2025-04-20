// prisma/seeds/tickets.ts
import { faker } from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { SEEDS } from './seed-constants';

function generateTicketNumber(eventId: number): string {
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '');
    const uniqueId = uuidv4().split('-')[0];
    return `${SEEDS.TICKETS.NUMBER_PREFIX}-${eventId}-${timestamp}-${uniqueId}`;
}

function generateTicketsForEvent(eventId: number, count: number) {
    const ticketTypes = [
        {
            title: SEEDS.TICKETS.TYPES.STANDARD.TITLE,
            priceRange: {
                min: SEEDS.TICKETS.TYPES.STANDARD.MIN_PRICE,
                max: SEEDS.TICKETS.TYPES.STANDARD.MAX_PRICE,
            },
        },
        {
            title: SEEDS.TICKETS.TYPES.VIP.TITLE,
            priceRange: {
                min: SEEDS.TICKETS.TYPES.VIP.MIN_PRICE,
                max: SEEDS.TICKETS.TYPES.VIP.MAX_PRICE,
            },
        },
        {
            title: SEEDS.TICKETS.TYPES.PREMIUM.TITLE,
            priceRange: {
                min: SEEDS.TICKETS.TYPES.PREMIUM.MIN_PRICE,
                max: SEEDS.TICKETS.TYPES.PREMIUM.MAX_PRICE,
            },
        },
    ];

    return Array.from({ length: count }, () => {
        const ticketType = faker.helpers.arrayElement(ticketTypes);
        const status = faker.helpers.weightedArrayElement([
            { value: TicketStatus.AVAILABLE, weight: SEEDS.TICKETS.STATUS_WEIGHTS.AVAILABLE },
            { value: TicketStatus.RESERVED, weight: SEEDS.TICKETS.STATUS_WEIGHTS.RESERVED },
            { value: TicketStatus.SOLD, weight: SEEDS.TICKETS.STATUS_WEIGHTS.SOLD },
            { value: TicketStatus.UNAVAILABLE, weight: SEEDS.TICKETS.STATUS_WEIGHTS.UNAVAILABLE },
        ]);

        return {
            eventId,
            title: ticketType.title,
            number: generateTicketNumber(eventId),
            price: faker.number.float({
                min: ticketType.priceRange.min,
                max: ticketType.priceRange.max,
                fractionDigits: 2,
            }),
            status,
        };
    });
}

export const initialTickets = Array.from(
    { length: SEEDS.EVENTS.TOTAL },
    (_, index) => {
        const eventId = index + 1;
        const ticketsCount = faker.number.int({
            min: SEEDS.TICKETS.MIN_PER_EVENT,
            max: SEEDS.TICKETS.MAX_PER_EVENT,
        });
        return generateTicketsForEvent(eventId, ticketsCount);
    },
).flat();
