import { ApiProperty, PickType } from '@nestjs/swagger';
import { Ticket } from '../entities/ticket.entity';

export class TicketTypeDto extends PickType(Ticket, ['title', 'price']) {
    @ApiProperty({
        description: 'Number of available tickets of this type',
        nullable: false,
        type: 'number',
        example: 100,
        minimum: 0
    })
    count: number;
} 