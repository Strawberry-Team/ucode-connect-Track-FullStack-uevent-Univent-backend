// src/payment/stripe/stripe.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersRepository } from '../../models/orders/orders.repository';
import { PaymentStatus } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class StripeService implements OnModuleInit {
    private stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly ordersRepository: OrdersRepository,
    ) {}

    onModuleInit() {
        const apiKey = String(this.configService.get<string>('payment.stripe.secretKey'));

        this.stripe = new Stripe(apiKey, {
            apiVersion: String(this.configService.get<string>('payment.stripe.apiVersion')) as Stripe.LatestApiVersion, // Use the latest API version available
        });
    }

    async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, userId: number): Promise<{
        clientSecret: string;
        publishableKey: string;
    }> {
        const order = await this.ordersRepository.findById(createPaymentIntentDto.orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${createPaymentIntentDto.orderId} not found`);
        }

        // if (order.userId !== userId) {
        //     throw new Error('You do not have permission to pay for this order');
        // } TODO: take it to the garden

        if (order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.REFUNDED) {
            throw new BadRequestException('This order has already been paid or refunded');
        }

        const amountInSmallestUnit = order.totalAmount.mul(100).toNumber();

        let paymentIntent: Stripe.PaymentIntent;

        const existingIntents = await this.stripe.paymentIntents.search({
            query: `metadata['orderId']:'${createPaymentIntentDto.orderId}'`,
            limit: 1,
        });

        if (existingIntents.data.length > 0 &&
            existingIntents.data[0].status !== 'canceled' &&
            existingIntents.data[0].status !== 'succeeded') {

            paymentIntent = await this.stripe.paymentIntents.update(
                existingIntents.data[0].id,
                {
                    amount: amountInSmallestUnit,
                }
            );
        } else {
            await this.ordersRepository.update(createPaymentIntentDto.orderId, {
                paymentStatus: PaymentStatus.PENDING,
            });

            paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInSmallestUnit,
                currency: 'usd',
                metadata: {
                    orderId: createPaymentIntentDto.orderId,
                    userId: userId,
                },
                setup_future_usage: 'off_session',
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            await this.ordersRepository.update(createPaymentIntentDto.orderId, {
                paymentIntentId: paymentIntent.id,
            });
        }

        return {
            clientSecret: paymentIntent.client_secret!,
            publishableKey: String(this.configService.get<string>('payment.stripe.publishableKey')),
        };
    }
}
