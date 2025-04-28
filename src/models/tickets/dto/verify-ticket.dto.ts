// src/models/tickets/dto/verify-ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class VerifyTicketDto {
    @ApiProperty({
        description: 'Ticket number in a specific format',
        nullable: false,
        type: 'string',
        example: 'TICKET-1-1744358896023',
    })
    @Matches(/^TICKET-\d+-[0-9A-F]{12}$/, {
        message: 'Incorrect ticket number format. Should correspond to the format TICKET-{eventId}-{randomPart}'
    })
    ticketNumber: string;
}
