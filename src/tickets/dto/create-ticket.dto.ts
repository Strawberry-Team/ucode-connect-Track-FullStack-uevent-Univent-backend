// src/tickets/dto/create-ticket.dto.ts
import { TicketStatus } from '@prisma/client';
import {
    IsTicketEventId,
    IsTicketNumber,
    IsTicketPrice,
    IsTicketStatus,
    IsTicketTitle,
} from '../tickets.validator';

export class CreateTicketDto {
    @IsTicketEventId()
    eventId: number;

    @IsTicketTitle(false)
    title: string;

    @IsTicketNumber(true)
    number: string;

    @IsTicketPrice(false)
    price: number;

    @IsTicketStatus(true)
    status?: TicketStatus = TicketStatus.AVAILABLE;
}
