// src/tickets/entities/ticket.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export enum TicketStatus {
    SOLD = 'sold',
    RESERVED = 'reserved',
    AVAILABLE = 'available',
}

export class Ticket {
    @ApiProperty({ description: 'Unique ticket identifier' })
    id: number;

    @ApiProperty({ description: 'ID of the event to which the ticket relates' })
    eventId: number;

    @ApiProperty({ description: 'Ticket name' })
    title: string;

    @ApiProperty({ description: 'Unique ticket number' })
    number: string;

    @ApiProperty({ description: 'Tiket price', type: Number })
    price: Decimal;

    @ApiProperty({
        description: 'Tiket status (can be sold, reserved, avalible)',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status: TicketStatus;

    @ApiProperty({ description: 'Date the ticket was created' })
    createdAt: Date;

    @ApiProperty({ description: 'Date of last ticket update' })
    updatedAt: Date;
}
