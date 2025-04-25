// src/payment/stripe/dto/create-payment-intent.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from '../../../common/validators/id.validator';

export class CreatePaymentIntentDto {
    @ApiProperty({
        description: 'Order identifier for creating a payment intention',
        type: Number,
        example: 1,
        required: true
    })
    @IsId(false)
    orderId: number;
}
