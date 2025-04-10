// src/models/tickets/dto/create-ticket.dto.ts
import { TicketStatus } from '@prisma/client';
import {
    IsTicketNumber,
    IsTicketPrice,
    IsTicketStatus,
} from '../validators/tickets.validator';
import { IsId } from '../../../common/validators/id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators/name.validator';

export class CreateTicketDto {
    @IsId(false)
    @ApiProperty({
        description: 'Event ID associated with the ticket',
        example: 1,
    })
    eventId: number;

    @IsName(false)
    @ApiProperty({
        description: 'Ticket title',
        example: 'VIP Ticket',
    })
    title: string;

    @IsTicketNumber(true)
    @ApiProperty({
        description: 'Unique ticket number',
        example: 'TICKET-123-456',
    })
    number: string;

    @IsTicketPrice(false)
    @ApiProperty({
        description: 'Ticket price',
        example: 99.99,
    })
    price: number;

    @IsTicketStatus(true)
    @ApiProperty({
        description: 'Ticket status',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status?: TicketStatus = TicketStatus.AVAILABLE;
}
