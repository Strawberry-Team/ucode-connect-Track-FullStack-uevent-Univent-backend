// test/fake-data/fake-tickets.ts
import { Ticket } from '../../src/models/tickets/entities/ticket.entity';
import { faker } from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';

export function generateFakeTicketId(): number {
    return faker.number.int({ min: 1, max: 1000 });
}

export function generateFakeTicket(): Ticket {
    return {
        id: generateFakeTicketId(),
        eventId: faker.number.int({ min: 1, max: 100 }),
        title: faker.lorem.words(3),
        number: `TICKET-${faker.string.uuid().slice(0, 8)}`,
        price: faker.number.float({ min: 1, max: 100 }),
        status: faker.helpers.arrayElement(Object.values(TicketStatus)),
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
