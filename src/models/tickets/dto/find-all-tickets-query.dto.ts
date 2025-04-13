// src/models/tickets/dto/update-ticket.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

export class FindAllTicketsQueryDto extends PartialType(
    OmitType(CreateTicketDto, ['quantity', 'price']),
) {}
