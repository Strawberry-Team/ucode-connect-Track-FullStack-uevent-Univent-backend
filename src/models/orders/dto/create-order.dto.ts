import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { CreateOrderItemDto } from '../order-items/dto/create-order-item.dto';
import { IsId } from '../../../common/validators/id.validator';
import { IsEnumValue } from '../../../common/validators/enum.validator';
import { ValidateNestedArray } from '../../../common/validators/validate-nested-array.validator';
import {IsEnglishNameWithNumbers} from "../../../common/validators/name.validator";

export class CreateOrderDto {
    @ApiPropertyOptional({
        description: 'Promo code applied to the orders',
        type: String,
        example: 'TECH2023',
        nullable: true,
    })
    @IsEnglishNameWithNumbers(true, true, 5, 30)
    promoCode?: string | null;

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
