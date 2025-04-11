// src/models/tickets/dto/create-ticket.dto.ts
import { TicketStatus } from '@prisma/client';
import {
    IsTicketPrice,
    IsTicketStatus,
} from '../validators/tickets.validator';
import { IsId } from '../../../common/validators/id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators/name.validator';

export class CreateTicketDto {
    @IsId(false)
    @ApiProperty({
        required: true,
        description: 'Event ID associated with the ticket',
        nullable: false,
        type: 'number',
        example: 1,
    })
    eventId: number;


    @IsName(false)
    @ApiProperty({
        required: true,
        description: 'Ticket title',
        nullable: false,
        type: 'string',
        example: 'VIP Ticket',
    })
    title: string;

    @IsTicketPrice(false)
    @ApiProperty({
        description: 'Ticket price',
        required: true,
        nullable: false,
        type: 'number',
        example: 99.99,
    })
    price: number;

    @IsTicketStatus(true)
    @ApiProperty({
        description: 'Ticket status',
        required: true,
        nullable: false,
        type: 'string',
        example: TicketStatus.SOLD,
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE
    })
    status?: TicketStatus = TicketStatus.AVAILABLE;
}
