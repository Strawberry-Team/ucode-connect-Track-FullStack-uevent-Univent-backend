// src/payment/stripe/stripe.controller.ts
import {
    Controller,
    Post,
    Body,
    UseGuards, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../models/auth/guards/auth.guards';
import { UserId } from '../../common/decorators/user.decorator';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';


@ApiTags('Payments')
@Controller('payments/stripe')
@UseGuards(JwtAuthGuard)
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @Post('payment-intents')
    @ApiOperation({ summary: 'Create a payment intent for an order' })
    @ApiBody({
        required: true,
        type: CreatePaymentIntentDto,
        description: 'Order ID for payment intent'
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Payment intent created successfully',
        type: PaymentIntentResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'This order has already been paid or refunded',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'This order has already been paid',
                },
                error: {
                    type: 'string',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'User does not own this order',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'You do not own this order',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Order not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Order not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    async createPaymentIntent(
        @Body() createPaymentIntentDto: CreatePaymentIntentDto,
        @UserId() userId: number,
    ): Promise<PaymentIntentResponseDto> {
        return await this.stripeService.createPaymentIntent(
            createPaymentIntentDto,
            userId,
        );
    }
}
