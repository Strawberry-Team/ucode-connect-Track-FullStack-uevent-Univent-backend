// src/tickets/dto/create-ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import {
    IsTicketEventId,
    IsTicketNumber,
    IsTicketPrice,
    IsTicketStatus,
    IsTicketTitle,
} from '../tickets.validator';
import { ToDecimal } from '../decorators/decimal.decorator';

export class CreateTicketDto {
    @IsTicketEventId()
    eventId: number;

    @IsTicketTitle(false)
    title: string;

    @IsTicketNumber(true)
    number: string;

    @ToDecimal()
    @IsTicketPrice(false)
    price: number;

    @IsTicketStatus(true)
    status?: TicketStatus = TicketStatus.AVAILABLE;
}
