import { Ticket } from '../entities/ticket.entity';
import { faker } from '@faker-js/faker';
import { TicketStatus, Prisma } from '@prisma/client';

export function generateFakeTicketId(): number {
    return faker.number.int({ min: 1, max: 1000 });
}

export function generateFakeTicket(): Ticket {
    return {
        id: generateFakeTicketId(),
        eventId: faker.number.int({ min: 1, max: 100 }),
        title: faker.lorem.words(3),
        number: `TICKET-${faker.string.uuid().slice(0, 8)}`,
        price: new Prisma.Decimal(
            faker.finance.amount({ min: 5, max: 100, dec: 2 })
        ),
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
