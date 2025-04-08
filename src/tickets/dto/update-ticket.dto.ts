// src/tickets/dto/update-ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import {
    IsTicketPrice,
    IsTicketStatusValid,
    IsTicketTitle,
} from '../tickets.validator';

export class UpdateTicketDto {
    @IsTicketTitle(true)
    title?: string;

    @IsTicketPrice(true)
    price?: number;

    @IsTicketStatusValid()
    status?: TicketStatus;
}
