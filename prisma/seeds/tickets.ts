// prisma/seeds/tickets.ts
import { faker } from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { SEED_COUNTS } from './seed-constants';

let ticketCounter = 0;

function generateTicketNumber(eventId: number): string {
    const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '');
    const uniqueId = uuidv4().split('-')[0];
    return `TICKET-${eventId}-${timestamp}-${uniqueId}`;
}

function generateTicketsForEvent(eventId: number, count: number) {
    const ticketTypes = [
        {
            title: 'Standard',
            priceRange: { 
                min: SEED_COUNTS.TICKETS.TYPES.STANDARD.MIN_PRICE, 
                max: SEED_COUNTS.TICKETS.TYPES.STANDARD.MAX_PRICE 
            }
        },
        {
            title: 'VIP',
            priceRange: { 
                min: SEED_COUNTS.TICKETS.TYPES.VIP.MIN_PRICE, 
                max: SEED_COUNTS.TICKETS.TYPES.VIP.MAX_PRICE 
            }
        },
        {
            title: 'Premium',
            priceRange: { 
                min: SEED_COUNTS.TICKETS.TYPES.PREMIUM.MIN_PRICE, 
                max: SEED_COUNTS.TICKETS.TYPES.PREMIUM.MAX_PRICE 
            }
        }
    ];

    return Array.from({ length: count }, () => {
        const ticketType = faker.helpers.arrayElement(ticketTypes);
        const status = faker.helpers.arrayElement([
            TicketStatus.AVAILABLE,
            TicketStatus.AVAILABLE,
            TicketStatus.AVAILABLE,
            TicketStatus.AVAILABLE,
            TicketStatus.AVAILABLE,
            TicketStatus.RESERVED,
            TicketStatus.SOLD,
            TicketStatus.UNAVAILABLE
        ]);

        return {
            eventId,
            title: ticketType.title,
            number: generateTicketNumber(eventId),
            price: faker.number.float({ 
                min: ticketType.priceRange.min, 
                max: ticketType.priceRange.max, 
                fractionDigits: 2 
            }),
            status
        };
    });
}

export const initialTickets = Array.from({ length: SEED_COUNTS.EVENTS.TOTAL }, (_, index) => {
    const eventId = index + 1;
    const ticketsCount = faker.number.int({ 
        min: SEED_COUNTS.TICKETS.MIN_PER_EVENT, 
        max: SEED_COUNTS.TICKETS.MAX_PER_EVENT 
    });
    return generateTicketsForEvent(eventId, ticketsCount);
}).flat(); 