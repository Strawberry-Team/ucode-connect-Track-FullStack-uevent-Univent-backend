import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { CreateOrderItemDto } from '../order-items/dto/create-order-item.dto';
import { IsId } from '../../../common/validators/id.validator';
import { IsEnumValue } from '../../../common/validators/enum.validator';
import { ValidateNestedArray } from '../../../common/validators/validate-nested-array.validator';

export class CreateOrderDto {
    @ApiPropertyOptional({
        description: 'Promo code identifier applied to the orders',
        type: Number,
        example: 123,
        nullable: true,
    })
    @IsId(true, true)
    promoCodeId?: number | null;

    @ApiProperty({
        description: 'Payment method for the orders',
        enum: PaymentMethod,
        example: PaymentMethod.STRIPE,
    })
    @IsEnumValue(PaymentMethod, true)
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Event identifier for which the orders is created',
        type: Number,
        example: 42,
    })
    @IsId(false)
    eventId: number;

    @ApiProperty({
        description: 'List of ticket types and quantities to purchase',
        type: [CreateOrderItemDto],
        minItems: 1,
    })
    @ValidateNestedArray({ itemType: CreateOrderItemDto })
    items: CreateOrderItemDto[];
}
