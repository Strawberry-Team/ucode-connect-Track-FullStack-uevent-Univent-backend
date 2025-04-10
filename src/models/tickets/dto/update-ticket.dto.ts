// src/models/tickets/dto/update-ticket.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(
    OmitType(CreateTicketDto, ['eventId', 'number']),
) {}
