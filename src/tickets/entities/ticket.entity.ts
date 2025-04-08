// src/tickets/entities/ticket.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { TicketStatus } from '@prisma/client';
import { Ticket as PrismaTicket } from '@prisma/client';

export class Ticket implements PrismaTicket{
    id: number;

    eventId: number;

    title: string;

    number: string;

    price: Decimal;

    status: TicketStatus;

    createdAt: Date;

    updatedAt: Date;
}
