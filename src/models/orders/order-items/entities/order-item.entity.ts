import { OrderItem as PrismaOrderItem } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    @ApiPropertyOptional({
        description: 'Unique key (UUID) identifying the generated ticket PDF file',
        type: 'string',
        format: 'uuid',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        nullable: true,
    })
    ticketFileKey: string | null;

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
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;
}
