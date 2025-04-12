// src/models/tickets/dto/create-ticket.dto.ts
import { TicketStatus } from '@prisma/client';
import {
    IsQuantity,
    IsTicketPrice,
    IsTicketStatus,
} from '../validators/tickets.validator';
import { IsId } from '../../../common/validators/id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators/name.validator';
import {IsNumber, IsPositive} from "class-validator";

export class CreateTicketDto {
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
    })
    status?: TicketStatus;

    @IsQuantity(true)
    @ApiProperty({
        description: 'Quantity of tickets',
        required: true,
        nullable: false,
        type: 'number',
        example: 100,
    })
    quantity?: number;
}
