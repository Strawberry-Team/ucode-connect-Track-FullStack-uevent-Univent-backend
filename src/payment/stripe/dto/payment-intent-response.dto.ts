// src/payment/stripe/dto/payment-intent-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentIntentResponseDto {
    @ApiProperty({
        description: 'Client secret key for initialisation Stripe Elements',
        example: 'pi_3NXRZ7I5yUMS12cA1ZpNoRQW_secret_WxshX2XDll2Gk9ZioMM4yHxoq'
    })
    clientSecret: string;

    @ApiProperty({
        description: 'Publishable key Stripe',
        example: 'pk_test_12345abcdef'
    })
    publishableKey: string;
}
