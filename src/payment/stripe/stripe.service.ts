// src/payment/stripe/stripe.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersRepository } from '../../models/orders/orders.repository';
import { DatabaseService } from '../../db/database.service';
import { PaymentStatus } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { TicketsRepository } from '../../models/tickets/tickets.repository';
import { OrderItemsRepository } from '../../models/orders/order-items/order-items.repository';

@Injectable()
export class StripeService implements OnModuleInit {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly ordersRepository: OrdersRepository,
        private readonly ticketsRepository: TicketsRepository,
        private readonly orderItemsRepository: OrderItemsRepository,
        private readonly db: DatabaseService,
    ) {}

    onModuleInit() {
        const apiKey = String(this.configService.get<string>('payment.stripe.secret'));
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

        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('This order has already been paid');
        }

        const amountInSmallestUnit = order.totalAmount.mul(100).toNumber();

        // Try to find existing payment intent for this order in metadata
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
                paymentStatus: PaymentStatus.AWAITING_PAYMENT,
            });

            paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInSmallestUnit,
                currency: 'usd',
                metadata: {
                    orderId: createPaymentIntentDto.orderId,
                    userId: userId,
                },
                // Options to save payment method and allow future payments if needed
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

    async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = Number(paymentIntent.metadata.orderId);

        try {
            await this.db.$transaction(async (tx) => {
                await this.ordersRepository.update(orderId, {paymentStatus: PaymentStatus.PAID}, tx);

                const orderItems =await this.orderItemsRepository.findMany(orderId, tx);

                const ticketIds = orderItems.map(item => item.ticketId);

                await this.ticketsRepository.updateTicketStatus(ticketIds, "SOLD", "RESERVED",  tx);
            });

            this.logger.log(`Order ${orderId} payment processed successfully`);
        } catch (error) {
            this.logger.error(`Failed to process payment for order ${orderId}:`, error);
            throw error;
        }
    }

    async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = Number(paymentIntent.metadata.orderId);

        try {
            await this.db.$transaction(async (tx) => {
                await this.ordersRepository.update(orderId, {paymentStatus: PaymentStatus.PENDING}, tx);

                const orderItems =await this.orderItemsRepository.findMany(orderId, tx);

                const ticketIds = orderItems.map(item => item.ticketId);

                await this.ticketsRepository.updateTicketStatus(ticketIds, "AVAILABLE", "RESERVED", tx);
            });

            this.logger.log(`Order ${orderId} payment failed, tickets released`);
        } catch (error) {
            this.logger.error(`Failed to process failed payment for order ${orderId}:`, error);
            throw error;
        }
    }

    constructEventFromPayload(signature: string, payload: Buffer): Stripe.Event {
        const webhookSecret = String(this.configService.get<string>('payment.stripe.webhookSecret'));

        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );
    }
}













// src/payment/stripe/stripe.service.ts
import { Injectable, Logger, OnModuleInit, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersRepository } from '../../models/orders/orders.repository';
import { DatabaseService } from '../../db/database.service';
import { PaymentStatus, Prisma, TicketStatus } from '@prisma/client';
import { TicketsRepository } from '../../models/tickets/tickets.repository'; // Импортируем репозиторий билетов

@Injectable()
export class StripeService implements OnModuleInit {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly ordersRepository: OrdersRepository,
        private readonly ticketsRepository: TicketsRepository, // Инжектируем репозиторий билетов
        private readonly db: DatabaseService,
    ) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey) {
            this.logger.error('STRIPE_SECRET_KEY is not defined!');
            throw new Error('Stripe secret key is not configured.');
        }
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2024-04-10', // Используйте актуальную версию API
            typescript: true,
        });
        this.logger.log('Stripe service initialized');
    }

    /**
     * Создает или получает существующий PaymentIntent для заказа.
     * Сохраняет PI ID в заказе.
     */
    async createOrRetrievePaymentIntent(orderId: number, userId: number): Promise<{
        clientSecret: string;
        publishableKey: string;
        orderStatus: PaymentStatus;
    }> {
        const order = await this.ordersRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }
        if (order.userId !== userId) {
            throw new ForbiddenException('Permission denied to access this order');
        }
        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Order has already been paid');
        }
        if (order.paymentStatus === PaymentStatus.FAILED || order.paymentStatus === PaymentStatus.CANCELLED || order.paymentStatus === PaymentStatus.REFUNDED) {
            throw new BadRequestException(`Order status (${order.paymentStatus}) does not allow payment.`);
        }
        // Статус должен быть PENDING для создания/получения PI

        const amountInCents = order.totalAmount.mul(100).toNumber();
        const currency = 'usd'; // Или ваша валюта

        let paymentIntent: Stripe.PaymentIntent;

        try {
            if (order.stripePaymentIntentId) {
                // Пытаемся получить существующий PI
                paymentIntent = await this.stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

                // Проверяем статус существующего PI
                if (paymentIntent.status === 'succeeded') {
                    this.logger.warn(`Order ${orderId} requested PI, but existing PI ${paymentIntent.id} already succeeded. Syncing status.`);
                    // Синхронизируем статус, если он еще PENDING
                    if (order.paymentStatus === PaymentStatus.PENDING) {
                        await this.markOrderAsPaidAndTicketsSold(orderId, order.orderItems.map(i => i.ticketId));
                        order.paymentStatus = PaymentStatus.PAID; // Обновляем локально для ответа
                    }
                    throw new BadRequestException('Order has already been paid (synced from Stripe).');
                } else if (paymentIntent.status === 'canceled') {
                    this.logger.warn(`Order ${orderId} requested PI, but existing PI ${paymentIntent.id} was canceled. Failing order.`);
                    if (order.paymentStatus === PaymentStatus.PENDING) {
                        await this.failOrderAndReleaseTickets(orderId, order.orderItems.map(i => i.ticketId));
                        order.paymentStatus = PaymentStatus.FAILED; // Обновляем локально для ответа
                    }
                    throw new BadRequestException('Payment for this order was canceled.');
                } else if (paymentIntent.amount !== amountInCents || paymentIntent.currency !== currency) {
                    // Если сумма или валюта изменились (маловероятно в нашем флоу, но возможно), обновляем PI
                    this.logger.log(`Updating existing PaymentIntent ${paymentIntent.id} for order ${orderId}`);
                    paymentIntent = await this.stripe.paymentIntents.update(order.stripePaymentIntentId, {
                        amount: amountInCents,
                        currency: currency,
                    });
                }
                // Если статус 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing' - просто возвращаем client_secret
            } else {
                // Создаем новый PI
                this.logger.log(`Creating new PaymentIntent for order ${orderId}`);
                paymentIntent = await this.stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: currency,
                    metadata: {
                        orderId: String(orderId),
                        userId: String(userId),
                    },
                    automatic_payment_methods: { enabled: true },
                });

                // Сохраняем PI ID в заказе
                await this.ordersRepository.update(orderId, {
                    stripePaymentIntentId: paymentIntent.id,
                });
                this.logger.log(`Saved PaymentIntent ID ${paymentIntent.id} to order ${orderId}`);
            }

            if (!paymentIntent.client_secret) {
                throw new InternalServerErrorException('Failed to get client secret from PaymentIntent');
            }

            return {
                clientSecret: paymentIntent.client_secret,
                publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY')!,
                orderStatus: order.paymentStatus, // Возвращаем текущий статус заказа
            };

        } catch (error: any) {
            this.logger.error(`Error creating/retrieving PaymentIntent for order ${orderId}:`, error);
            if (error instanceof Stripe.errors.StripeInvalidRequestError && error.code === 'resource_missing' && order.stripePaymentIntentId) {
                // PI был удален или не найден, нужно создать новый
                this.logger.warn(`Referenced PaymentIntent ${order.stripePaymentIntentId} not found for order ${orderId}. Creating a new one.`);
                // Очищаем старый ID и рекурсивно вызываем функцию снова (осторожно с бесконечным циклом!)
                // Или просто создаем новый здесь
                await this.ordersRepository.update(orderId, { stripePaymentIntentId: null });
                // Рекурсивный вызов или дублирование логики создания нового PI
                return this.createOrRetrievePaymentIntent(orderId, userId); // Простой рекурсивный вызов
            }
            throw new InternalServerErrorException('Failed to initialize payment.');
        }
    }

    /**
     * Обрабатывает вебхук payment_intent.succeeded
     */
    async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = Number(paymentIntent.metadata.orderId);
        if (!orderId || isNaN(orderId)) {
            this.logger.error(`Webhook payment_intent.succeeded: Invalid orderId in metadata: ${paymentIntent.metadata.orderId}`);
            return;
        }

        this.logger.log(`Webhook payment_intent.succeeded received for order ${orderId}, PI: ${paymentIntent.id}`);
        await this.markOrderAsPaidAndTicketsSold(orderId, null); // Передаем null, т.к. ID билетов получим внутри
    }

    /**
     * Обрабатывает вебхук payment_intent.payment_failed
     */
    async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = Number(paymentIntent.metadata.orderId);
        if (!orderId || isNaN(orderId)) {
            this.logger.error(`Webhook payment_intent.payment_failed: Invalid orderId in metadata: ${paymentIntent.metadata.orderId}`);
            return;
        }

        this.logger.log(`Webhook payment_intent.payment_failed received for order ${orderId}, PI: ${paymentIntent.id}`);
        await this.failOrderAndReleaseTickets(orderId, null); // Передаем null, т.к. ID билетов получим внутри
    }

    /**
     * Верифицирует подпись вебхука
     */
    constructEventFromPayload(signature: string, payload: Buffer): Stripe.Event {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.error('STRIPE_WEBHOOK_SECRET is not defined!');
            throw new Error('Stripe webhook secret is not configured.');
        }
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }

    // --- Вспомогательные методы для обновления статусов ---

    /**
     * Помечает заказ как FAILED и освобождает билеты. Использует транзакцию.
     * @param orderId ID заказа
     * @param ticketIdsToRelease Массив ID билетов (если null, получит их из заказа)
     */
    async failOrderAndReleaseTickets(orderId: number, ticketIdsToRelease: number[] | null): Promise<void> {
        try {
            await this.db.$transaction(async (tx) => {
                const currentOrder = await tx.order.findUnique({
                    where: { id: orderId },
                    select: { paymentStatus: true, orderItems: !ticketIdsToRelease ? { select: { ticketId: true } } : false }
                });

                // Идемпотентность: не меняем статус, если он уже финальный
                if (!currentOrder || currentOrder.paymentStatus === PaymentStatus.FAILED || currentOrder.paymentStatus === PaymentStatus.PAID || currentOrder.paymentStatus === PaymentStatus.CANCELLED) {
                    this.logger.log(`Order ${orderId} is already in a final state (${currentOrder?.paymentStatus}). Skipping fail action.`);
                    return;
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: { paymentStatus: PaymentStatus.FAILED },
                });
                this.logger.log(`Order ${orderId} status updated to FAILED.`);

                const finalTicketIds = ticketIdsToRelease ?? currentOrder!.orderItems.map(i => i.ticketId);

                if (finalTicketIds.length > 0) {
                    const updateResult = await tx.ticket.updateMany({
                        where: {
                            id: { in: finalTicketIds },
                            status: TicketStatus.RESERVED, // Освобождаем только зарезервированные
                        },
                        data: { status: TicketStatus.AVAILABLE },
                    });
                    this.logger.log(`Released ${updateResult.count} tickets for failed order ${orderId}.`);
                }
            });
        } catch (error) {
            this.logger.error(`Error failing order ${orderId} and releasing tickets:`, error);
            // Не пробрасываем ошибку дальше, чтобы не сломать обработку других событий/заказов
        }
    }

    /**
     * Помечает заказ как PAID и билеты как SOLD. Использует транзакцию.
     * @param orderId ID заказа
     * @param ticketIdsToMarkSold Массив ID билетов (если null, получит их из заказа)
     */
    async markOrderAsPaidAndTicketsSold(orderId: number, ticketIdsToMarkSold: number[] | null): Promise<void> {
        try {
            await this.db.$transaction(async (tx) => {
                const currentOrder = await tx.order.findUnique({
                    where: { id: orderId },
                    select: { paymentStatus: true, orderItems: !ticketIdsToMarkSold ? { select: { ticketId: true } } : false }
                });

                // Идемпотентность: не меняем статус, если он уже PAID
                if (!currentOrder || currentOrder.paymentStatus === PaymentStatus.PAID) {
                    this.logger.log(`Order ${orderId} is already PAID. Skipping success action.`);
                    return;
                }
                // Если заказ FAILED/CANCELLED, но пришел succeeded - это странно, логируем и не меняем
                if (currentOrder.paymentStatus === PaymentStatus.FAILED || currentOrder.paymentStatus === PaymentStatus.CANCELLED) {
                    this.logger.error(`Order ${orderId} received succeeded webhook but status is ${currentOrder.paymentStatus}. Investigate! Skipping.`);
                    return;
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: { paymentStatus: PaymentStatus.PAID },
                });
                this.logger.log(`Order ${orderId} status updated to PAID.`);

                const finalTicketIds = ticketIdsToMarkSold ?? currentOrder!.orderItems.map(i => i.ticketId);

                if (finalTicketIds.length > 0) {
                    const updateResult = await tx.ticket.updateMany({
                        where: {
                            id: { in: finalTicketIds },
                            // Можно проверять статус RESERVED, но если вебхук пришел с задержкой,
                            // а шедулер уже освободил билеты, будет проблема.
                            // Безопаснее просто пометить как SOLD, если заказ оплачен.
                            // status: TicketStatus.RESERVED,
                        },
                        data: { status: TicketStatus.SOLD },
                    });
                    this.logger.log(`Marked ${updateResult.count} tickets as SOLD for paid order ${orderId}.`);
                }
                // Здесь можно добавить логику отправки email-подтверждения и т.д.
            });
        } catch (error) {
            this.logger.error(`Error marking order ${orderId} as PAID and tickets SOLD:`, error);
        }
    }

    // --- Методы для шедулера ---

    async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (error: any) {
            if (error.code === 'resource_missing') {
                return null; // PI не найден
            }
            this.logger.error(`Error retrieving PaymentIntent ${paymentIntentId}:`, error);
            throw error; // Пробрасываем другие ошибки
        }
    }

    async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
        try {
            return await this.stripe.paymentIntents.cancel(paymentIntentId);
        } catch (error: any) {
            if (error.code === 'payment_intent_unexpected_state') {
                this.logger.warn(`Could not cancel PI ${paymentIntentId} due to its current state (${error.payment_intent?.status}).`);
                return error.payment_intent; // Возвращаем PI, чтобы проверить статус
            } else if (error.code === 'resource_missing') {
                this.logger.warn(`Could not cancel PI ${paymentIntentId} because it was not found.`);
                return null; // Считаем отмененным
            }
            this.logger.error(`Error cancelling PI ${paymentIntentId}:`, error);
            throw error; // Пробрасываем другие ошибки
        }
    }
}
