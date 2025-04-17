import { ApiProperty } from '@nestjs/swagger';
import { IsQuantity } from '../../../tickets/validators/tickets.validator';
import { IsName } from '../../../../common/validators/name.validator';

export class CreateOrderItemDto {
    @ApiProperty({
        description: 'Title of the ticket type to purchase',
        example: 'VIP',
    })
    @IsName(false)
    ticketTitle: string;

    @ApiProperty({
        description: 'Number of tickets to purchase of this type',
        example: 2,
        minimum: 1,
    })
    @IsQuantity(false)
    quantity: number;
}
