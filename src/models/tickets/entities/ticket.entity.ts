// src/models/tickets/entities/ticket.entity.ts
import { TicketStatus } from '@prisma/client';
import { Ticket as PrismaTicket } from '@prisma/client';
import { Expose } from 'class-transformer';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    SYSTEMIC: ['basic', 'systemic'],
};

type TicketWithNumberPrice = Omit<PrismaTicket, 'price'> & {
    price: number;
};

export class Ticket implements TicketWithNumberPrice {
    @Expose({ groups: ['basic'] })
    id: number;

    @Expose({ groups: ['basic'] })
    eventId: number;

    @Expose({ groups: ['basic'] })
    title: string;

    @Expose({ groups: ['basic'] })
    number: string;

    @Expose({ groups: ['basic'] })
    price: number;

    @Expose({ groups: ['basic'] })
    status: TicketStatus;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;
}
