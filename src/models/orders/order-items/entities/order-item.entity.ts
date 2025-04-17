import { OrderItem as PrismaOrderItem } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

type OrderWithNumberTotalAmount = Omit<PrismaOrderItem, 'initialPrice' | 'finalPrice'> & {
    initialPrice: number;
    finalPrice: number;
};

export class OrderItem implements OrderWithNumberTotalAmount {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Order item identifier',
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Order identifier this item belongs to',
        type: 'number',
        example: 1,
    })
    orderId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Ticket identifier purchased in this orders item',
        type: 'number',
        example: 1,
    })
    ticketId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Initial price of the ticket before any discounts',
        type: 'number',
        example: 99.99,
    })
    initialPrice: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Final price of the ticket after discounts',
        type: 'number',
        example: 89.99,
    })
    finalPrice: number;

    @Expose({ groups: ['systemic'] })
    @ApiProperty({
        description: 'Order item creation date',
        type: 'string',
        format: 'date-time',
        example: '2024-04-16T12:34:56.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    @ApiProperty({
        description: 'Order item last update date',
        type: 'string',
        format: 'date-time',
        example: '2024-04-16T12:34:56.000Z',
    })
    updatedAt: Date;
}
