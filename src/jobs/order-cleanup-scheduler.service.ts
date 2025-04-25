// src/jobs/order-cleanup-scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../db/database.service';
import { OrdersRepository } from '../models/orders/orders.repository';
import { PaymentStatus, Prisma, TicketStatus } from '@prisma/client';
import { StripeService } from '../payment/stripe/stripe.service'; // Импортируем StripeService

@Injectable()
export class OrderCleanupSchedulerService {
    private readonly logger = new Logger(OrderCleanupSchedulerService.name);
    private readonly ORDER_EXPIRATION_MINUTES = 20; // 20 минут

    constructor(
        private readonly db: DatabaseService,
        private readonly ordersRepository: OrdersRepository,
        private readonly stripeService: StripeService, // Инжектируем StripeService
    ) {}

    @Cron(CronExpression.EVERY_5_MINUTES) // Запускать каждые 5 минут
    async handleExpiredPendingOrders() {
        this.logger.log('Running job to clean up expired PENDING orders...');

        const expirationTime = new Date(
            Date.now() - this.ORDER_EXPIRATION_MINUTES * 60 * 1000,
        );

        const expiredOrders = await this.db.order.findMany({
            where: {
                paymentStatus: PaymentStatus.PENDING,
                createdAt: { lt: expirationTime },
            },
            select: {
                id: true,
                stripePaymentIntentId: true, // Включаем ID PI
                orderItems: { select: { ticketId: true } },
            },
        });

        if (expiredOrders.length === 0) {
            this.logger.log('No expired PENDING orders found.');
            return;
        }

        this.logger.log(`Found ${expiredOrders.length} expired PENDING orders to process.`);

        for (const order of expiredOrders) {
            const orderId = order.id;
            const paymentIntentId = order.stripePaymentIntentId;
            const ticketIds = order.orderItems.map(item => item.ticketId);

            this.logger.log(`Processing expired order ${orderId}, PI: ${paymentIntentId}`);

            try {
                // Оборачиваем логику обработки одного заказа в транзакцию
                await this.db.$transaction(async (tx) => {
                    if (!paymentIntentId) {
                        // Если PI ID нет, просто отменяем заказ
                        this.logger.warn(`Order ${orderId} PENDING expired without PaymentIntent ID. Failing order.`);
                        await this.failOrderAndReleaseTicketsInternal(orderId, ticketIds, tx);
                        return; // Переходим к следующему заказу
                    }

                    // Если PI ID есть, проверяем статус в Stripe
                    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

                    if (!paymentIntent) {
                        // PI не найден в Stripe (возможно, удален или ошибка)
                        this.logger.warn(`Order ${orderId} PENDING expired. Associated PI ${paymentIntentId} not found in Stripe. Failing order.`);
                        await this.failOrderAndReleaseTicketsInternal(orderId, ticketIds, tx);
                        return;
                    }

                    this.logger.log(`Order ${orderId}: Retrieved PI ${paymentIntent.id}, status: ${paymentIntent.status}`);

                    // Анализируем статус PI
                    switch (paymentIntent.status) {
                        case 'succeeded':
                            this.logger.warn(`Order ${orderId} PENDING expired, but PI status is SUCCEEDED. Syncing status.`);
                            await this.markOrderAsPaidAndTicketsSoldInternal(orderId, ticketIds, tx);
                            break;

                        case 'processing':
                        case 'requires_action':
                        case 'requires_capture':
                            // Платеж активен, НЕ ТРОГАЕМ
                            this.logger.log(`Order ${orderId} PENDING expired, but PI status is ${paymentIntent.status}. Skipping cleanup.`);
                            break;

                        case 'requires_payment_method':
                        case 'requires_confirmation':
                        case 'canceled':
                        default: // Включая неизвестные или будущие статусы
                            // Платеж не активен или уже отменен. Отменяем PI в Stripe и заказ у нас.
                            this.logger.log(`Order ${orderId} PENDING expired. PI status: ${paymentIntent.status}. Attempting to cancel PI and fail order.`);

                            // Пытаемся отменить PI в Stripe
                            const cancelledPi = await this.stripeService.cancelPaymentIntent(paymentIntentId);

                            if (cancelledPi && ['processing', 'succeeded', 'requires_capture', 'requires_action'].includes(cancelledPi.status)) {
                                // Отмена не удалась, т.к. PI в активном/успешном состоянии
                                this.logger.warn(`Order ${orderId}: Could not cancel PI ${paymentIntentId} (current status: ${cancelledPi.status}). Skipping cleanup.`);
                                // НЕ меняем статус заказа, т.к. платеж может быть в процессе или успешен
                            } else {
                                // PI успешно отменен, не найден или был в неактивном состоянии. Отменяем заказ локально.
                                this.logger.log(`Order ${orderId}: PI cancellation successful or not needed. Failing order locally.`);
                                await this.failOrderAndReleaseTicketsInternal(orderId, ticketIds, tx);
                            }
                            break;
                    }
                }); // Конец транзакции для одного заказа
            } catch (error: any) {
                // Ловим ошибки при обработке одного заказа (включая ошибки Stripe API из retrieve/cancel)
                this.logger.error(`Failed to process expired order ${orderId} due to error:`, error.message || error);
                // Продолжаем со следующим заказом
            }
        } // Конец цикла for
        this.logger.log('Finished cleaning up expired PENDING orders.');
    }

    // --- Внутренние вспомогательные методы для работы в транзакции ---
    private async failOrderAndReleaseTicketsInternal(orderId: number, ticketIds: number[], tx: Prisma.TransactionClient) {
        const updatedOrder = await tx.order.updateMany({
            where: { id: orderId, paymentStatus: PaymentStatus.PENDING }, // Обновляем только если все еще PENDING
            data: { paymentStatus: PaymentStatus.FAILED },
        });

        if (updatedOrder.count > 0 && ticketIds.length > 0) {
            const releasedTickets = await tx.ticket.updateMany({
                where: { id: { in: ticketIds }, status: TicketStatus.RESERVED },
                data: { status: TicketStatus.AVAILABLE },
            });
            this.logger.log(`Order ${orderId} marked FAILED, released ${releasedTickets.count} tickets.`);
        } else if (updatedOrder.count === 0) {
            this.logger.log(`Order ${orderId} status was not PENDING during fail attempt. No changes made.`);
        }
    }

    private async markOrderAsPaidAndTicketsSoldInternal(orderId: number, ticketIds: number[], tx: Prisma.TransactionClient) {
        const updatedOrder = await tx.order.updateMany({
            where: { id: orderId, paymentStatus: { notIn: [PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.CANCELLED] } }, // Обновляем, если не финальный статус
            data: { paymentStatus: PaymentStatus.PAID },
        });

        if (updatedOrder.count > 0 && ticketIds.length > 0) {
            const soldTickets = await tx.ticket.updateMany({
                where: { id: { in: ticketIds } }, // Статус не проверяем, просто помечаем как SOLD
                data: { status: TicketStatus.SOLD },
            });
            this.logger.log(`Order ${orderId} marked PAID, marked ${soldTickets.count} tickets as SOLD.`);
        } else if (updatedOrder.count === 0) {
            this.logger.log(`Order ${orderId} status was already final during success sync attempt. No changes made.`);
        }
    }
}
