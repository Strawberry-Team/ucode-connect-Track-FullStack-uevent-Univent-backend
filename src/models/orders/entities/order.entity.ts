import {
    PaymentStatus,
    PaymentMethod,
    Order as PrismaOrder
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItem } from '../order-items/entities/order-item.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    PRIVATE: ['basic', 'confidential'],
    SYSTEMIC: ['basic', 'confidential', 'systemic'],
};

type OrderWithNumberTotalAmount = Omit<PrismaOrder, 'totalAmount'> & {
    totalAmount: number;
};

export class Order implements OrderWithNumberTotalAmount {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Order identifier',
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User identifier who placed the orders',
        type: 'number',
        example: 1,
    })
    userId: number;

    @Expose({ groups: ['basic'] })
    @ApiPropertyOptional({
        description: 'Promo code identifier used for the orders',
        type: 'number',
        example: 1,
        nullable: true,
    })
    promoCodeId: number | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Payment status of the orders',
        enum: PaymentStatus,
        example: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Payment method used for the orders',
        enum: PaymentMethod,
        example: PaymentMethod.STRIPE,
    })
    paymentMethod: PaymentMethod;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Total amount of the orders',
        type: 'number',
        example: 149.99,
    })
    totalAmount: number;

    @Expose({ groups: ['systemic'] })
    @ApiProperty({
        description: 'Order creation date',
        type: 'string',
        format: 'date-time',
        example: '2024-04-16T12:34:56.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    @ApiProperty({
        description: 'Order last update date',
        type: 'string',
        format: 'date-time',
        example: '2024-04-16T12:34:56.000Z',
    })
    updatedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiPropertyOptional({
        description: 'Order items',
        type: [OrderItem],
    })
    items?: OrderItem[];
}
