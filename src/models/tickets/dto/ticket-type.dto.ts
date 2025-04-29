import { ApiProperty } from '@nestjs/swagger';

export class TicketTypeDto {
    @ApiProperty({
        description: 'Title of the ticket type',
        example: 'VIP',
        type: String
    })
    title: string;

    @ApiProperty({
        description: 'Price of the ticket',
        example: 99.99,
        type: Number
    })
    price: number;

    @ApiProperty({
        description: 'Number of available tickets of this type',
        example: 100,
        type: Number
    })
    count: number;
}
