// src/tickets/dto/update-ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';
import {
    IsTicketPrice,
    IsTicketStatusValid,
    IsTicketTitle,
} from '../tickets.validator';
import { ToDecimal } from '../decorators/decimal.decorator';

export class UpdateTicketDto {
    @IsTicketTitle(true)
    title?: string;

    @ToDecimal()
    @IsTicketPrice(true)
    price?: number;

    @IsTicketStatusValid()
    status?: TicketStatus;
}
