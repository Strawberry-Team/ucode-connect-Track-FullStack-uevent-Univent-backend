// test/fake-data/fake-tickets.ts
import { Ticket } from '../../src/models/tickets/entities/ticket.entity';
import { faker } from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { TicketTypeDto } from '../../src/models/tickets/dto/ticket-type.dto';

const TICKET_TYPES = ['VIP', 'Standard', 'Premium'];

export function generateFakeTicketId(): number {
    return faker.number.int({ min: 1, max: 1000 });
}

export function generateFakeTicket(): Ticket {
    return {
        id: generateFakeTicketId(),
        eventId: faker.number.int({ min: 1, max: 100 }),
        title: faker.lorem.words(3),
        number: `TICKET-${faker.number.int({ min: 1, max: 100 })}-${faker.date.anytime()}`,
        price: faker.number.float({ min: 1, max: 100 }),
        status: faker.helpers.arrayElement(
            Object.values(TicketStatus).filter(
                (status) => status === TicketStatus.AVAILABLE || status === TicketStatus.UNAVAILABLE
            )
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export function pickTicketFields<K extends keyof Ticket>(
    ticket: Ticket,
    fields: K[]
): Pick<Ticket, K> {
    const result = {} as Pick<Ticket, K>;
    fields.forEach((field) => {
        if (field in ticket) {
            result[field] = ticket[field];
        }
    });
    return result;
}

export function generateFakeTicketType(): TicketTypeDto {
    return {
        title: faker.helpers.arrayElement(TICKET_TYPES),
        price: Number(faker.number.float({ min: 10, max: 500, fractionDigits: 2 })),
        count: faker.number.int({ min: 1, max: 200 })
    };
}

export function generateFakeTicketTypes(): TicketTypeDto[] {
    return Array.from({ length: TICKET_TYPES.length }, () => generateFakeTicketType());
}
