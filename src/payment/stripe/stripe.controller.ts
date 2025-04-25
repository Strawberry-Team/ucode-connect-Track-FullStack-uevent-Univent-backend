// src/payment/stripe/stripe.controller.ts
import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Headers,
    RawBodyRequest,
    HttpStatus,
    HttpCode,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../models/auth/guards/auth.guards';
import { UserId } from '../../common/decorators/user.decorator';
import { StripeService } from './stripe.service';
import { Logger } from '@nestjs/common';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

class PaymentIntentResponseDto {
    clientSecret: string;
    publishableKey: string;
}

@ApiTags('Payments')
@Controller('payments/stripe')
export class StripeController {
    private readonly logger = new Logger(StripeController.name);

    constructor(private readonly stripeService: StripeService) {}

    @Post('payment-intents')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a payment intent for an order' })
    @ApiParam({
        name: 'orderId',
        description: 'Order ID',
        type: Number,
        required: true,
        example: 1,
    })
    @ApiResponse({
        status: 201,
        description: 'Payment intent created successfully',
        type: PaymentIntentResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid order or order already paid',
    })
    @ApiResponse({ status: 403, description: 'User does not own this order' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async createPaymentIntent(
        @Body() createPaymentIntentDto: CreatePaymentIntentDto,
        @UserId() userId: number,
    ): Promise<PaymentIntentResponseDto> {
        return await this.stripeService.createPaymentIntent(
            createPaymentIntentDto,
            userId,
        );
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle Stripe webhook events' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
    async handleWebhook(
        @Req() request: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean }> {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const payload = request.rawBody;

        if (!payload) {
            throw new BadRequestException('Missing request body');
        }

        const event = this.stripeService.constructEventFromPayload(
            signature,
            payload,
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.stripeService.handlePaymentIntentSucceeded(
                    event.data.object as any,
                );
                break;
            case 'payment_intent.payment_failed':
                await this.stripeService.handlePaymentIntentFailed(
                    event.data.object as any,
                );
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }
}
