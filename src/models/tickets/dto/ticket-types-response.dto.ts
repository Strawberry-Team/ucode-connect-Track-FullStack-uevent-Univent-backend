import { ApiProperty } from '@nestjs/swagger';
import { TicketTypeDto } from './ticket-type.dto';

export class TicketTypesResponseDto {
    @ApiProperty({
        description: 'List of ticket types',
        type: [TicketTypeDto]
    })
    items: TicketTypeDto[];

    @ApiProperty({
        description: 'Total number of ticket types',
        example: 3,
        type: Number
    })
    total: number;
} 