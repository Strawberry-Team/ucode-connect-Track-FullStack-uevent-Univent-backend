// src/models/orders/orders.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException, InternalServerErrorException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items/order-items.repository';
import { CreateOrderDto } from './dto/create-order.dto';
// import { FindAllOrdersQueryDto } from './dto/find-all-orders-query.dto';
import { Order } from './entities/order.entity';
import { TicketsService } from '../tickets/tickets.service';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from './entities/order.entity';
import {PaymentStatus, Prisma, TicketStatus} from '@prisma/client';
import {Ticket} from "../tickets/entities/ticket.entity";
import {DatabaseService} from "../../db/database.service";
import {convertDecimalsToNumbers} from "../../common/utils/convert-decimal-to-number.utils";
import {PromoCodesService} from "../promo-codes/promo-codes.service";
import Stripe from 'stripe';
import {ConfigService} from "@nestjs/config";
import {TicketsRepository} from "../tickets/tickets.repository";

interface PaymentIntentWithRefunds extends Stripe.PaymentIntent {
    refunds: {
        object: 'list';
        data: Stripe.Refund[];
        has_more: boolean;
        url: string;
    } | null;
}

@Injectable()
export class OrdersService {
    private readonly stripe: Stripe;

    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly orderItemsRepository: OrderItemsRepository,
        private readonly ticketsService: TicketsService,
        private readonly promoCodesService: PromoCodesService,
        private readonly db: DatabaseService,
        private readonly configService: ConfigService,
        private readonly ticketRepository: TicketsRepository,
    ) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(String(apiKey), {
            apiVersion: String(this.configService.get<string>('payment.stripe.apiVersion')) as Stripe.LatestApiVersion,
        });
    }

    async create(dto: CreateOrderDto, userId: number): Promise<Order> {
        const { eventId, promoCode, paymentMethod, items } = dto;

        try {
            const createdOrderData = await this.db.$transaction(
                async (tx) => {
                    const selectedTickets: Ticket[] = [];
                    const ticketIdsToReserve: number[] = [];
                    let totalAmount = new Prisma.Decimal(0);
                    let discountMultiplier: Prisma.Decimal = Prisma.Decimal(1);
                    let foundPromoCode;
                    let promoCodeId: number | undefined;

                    for (const item of items) {
                        const availableTickets = await this.ticketsService.findAllTickets(
                            {
                                eventId: eventId,
                                title: item.ticketTitle,
                                status: TicketStatus.AVAILABLE,
                                limit: item.quantity,
                            },
                            tx,
                        );

                        if (availableTickets.total < item.quantity) {
                            throw new BadRequestException(
                                `Not enough available tickets of type ${item.ticketTitle}. Requested: ${item.quantity}, Available: ${availableTickets.total}`,
                            );
                        }

                        selectedTickets.push(...availableTickets.items);
                        ticketIdsToReserve.push(...availableTickets.items.map((t) => t.id));
                    }

                    if (ticketIdsToReserve.length === 0) {
                        throw new BadRequestException('No tickets were selected for the orders.');
                    }

                    const updateResult = await this.ticketsService.reserveTickets(
                        ticketIdsToReserve,
                        tx,
                    );

                    if (updateResult.count !== ticketIdsToReserve.length) {
                        throw new InternalServerErrorException(
                            'Failed to reserve all selected tickets due to concurrent modification. Please try again.',
                        );
                    }

                    if(promoCode) {
                        foundPromoCode = await this.promoCodesService.validatePromoCode({eventId, code: promoCode}, true)

                        const promoCodeDiscountPercent: number = foundPromoCode.promoCode.discountPercent;

                         discountMultiplier = new Prisma.Decimal(1).minus(
                            new Prisma.Decimal(promoCodeDiscountPercent)
                        );
                         promoCodeId = foundPromoCode.promoCode.id;
                    }

                    const orderItemsData: Array<{
                        ticketId: number;
                        initialPrice: Prisma.Decimal;
                        finalPrice: Prisma.Decimal;
                    }> = [];


                    selectedTickets.forEach((ticket) => {
                        const initialPrice: Prisma.Decimal = new Prisma.Decimal(ticket.price);
                        const finalPrice = initialPrice.mul(discountMultiplier).toDecimalPlaces(2);

                        totalAmount = totalAmount.add(finalPrice);
                        orderItemsData.push({
                            ticketId: ticket.id,
                            initialPrice: initialPrice,
                            finalPrice: finalPrice,
                        })
                    });

                    const orderData = {
                        ...dto,
                        ...(promoCodeId && { promoCodeId }),
                        userId,
                        totalAmount,
                    };
                    const createdOrder = await this.ordersRepository.create(orderData, tx);

                    const orderItemsInputData = orderItemsData.map((ticket) => {
                        return {
                            orderId: createdOrder.id,
                            ticketId: ticket.ticketId,
                            initialPrice: ticket.initialPrice,
                            finalPrice: ticket.finalPrice,
                        };
                    });

                    await this.orderItemsRepository.createMany(orderItemsInputData, tx);

                    const finalOrder = await this.ordersRepository.findById(createdOrder.id, tx)

                    if(!finalOrder){throw new NotFoundException()}

                    const transformedOrder = convertDecimalsToNumbers(finalOrder);

                    return transformedOrder as Order;
                },
                {
                    maxWait: 5000,
                    timeout: 10000,
                },
            );

            return plainToInstance(Order, createdOrderData, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        } catch (error) {
            if (error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof UnprocessableEntityException) {
                throw error;
            }
            console.error('Order creation transaction failed:', error);
            throw new InternalServerErrorException(
                'Failed to create orders due to an internal error.',
            );
        }
    }

    private async updateOrderPaymentStatus(
        order: Order,
        tx?: Prisma.TransactionClient,
    ): Promise<Order> {
        if (
            !order.paymentIntentId ||
            order.paymentStatus === PaymentStatus.PAID ||
            order.paymentStatus === PaymentStatus.REFUNDED
        ) {
            return order; // Пропускаем, если нет paymentIntentId или статус уже финальный
        }

        try {
            const paymentIntentResponse = await this.stripe.paymentIntents.retrieve(
                order.paymentIntentId
            );

            const refundsResponse = await this.stripe.refunds.list({
                payment_intent: order.paymentIntentId
            });

            const paymentIntent: PaymentIntentWithRefunds = {
                ...paymentIntentResponse,
                refunds: refundsResponse.object === 'list' ? refundsResponse : null
            };

            let newStatus: PaymentStatus;

            const hasFullRefund = paymentIntent.refunds?.data.some(
                refund => refund.status === 'succeeded' && refund.amount === paymentIntent.amount,
            );

            if (hasFullRefund) {
                newStatus = PaymentStatus.REFUNDED;
            } else {
                switch (paymentIntent.status) {
                    case 'succeeded':
                        newStatus = PaymentStatus.PAID;
                        break;
                    case 'requires_payment_method':
                    case 'requires_confirmation':
                    case 'requires_action':
                        newStatus = PaymentStatus.PENDING;
                        break;
                    case 'canceled':
                        newStatus = PaymentStatus.FAILED;
                        break;
                    default:
                        newStatus = PaymentStatus.FAILED;
                }
            }

            // Обновление, если статус или ошибка изменились
            if (newStatus !== order.paymentStatus) {
                const updatedOrder = await this.db.$transaction(
                    async (txClient) => {
                        const prismaClient = tx || txClient;
                        const updatedOrder = await this.ordersRepository.update(
                            order.id,
                            {
                                paymentStatus: newStatus,
                            },
                            prismaClient,
                        );

                        // Обновление статуса билетов
                        if (order.items && order.items.length > 0) {
                            const ticketIds = order.items.map(item => item.ticketId);
                            if (newStatus === PaymentStatus.PAID) {
                                await this.ticketRepository.updateTicketStatus(
                                    ticketIds,
                                    TicketStatus.SOLD,
                                    TicketStatus.RESERVED,
                                    prismaClient,
                                );
                            } else if (newStatus === PaymentStatus.FAILED || newStatus === PaymentStatus.REFUNDED) {
                                await this.ticketRepository.updateTicketStatus(
                                    ticketIds,
                                    TicketStatus.AVAILABLE,
                                    TicketStatus.RESERVED,
                                    prismaClient,
                                );
                            }
                        }

                        return updatedOrder;
                    },
                    {
                        maxWait: 5000,
                        timeout: 10000,
                    },
                );

                return convertDecimalsToNumbers(updatedOrder);
            }

            return order;
        } catch (error) {
            console.error(`Failed to retrieve PaymentIntent ${order.paymentIntentId}: ${error.message}`);
            return order;
        }
    }


    async getOrder(orderId: number, userId: number): Promise<Order> {
        const foundOrder = await this.ordersRepository.findById(orderId);

        if (!foundOrder) {
            throw new NotFoundException(`Order with id ${orderId} not found`);
        }

        if (foundOrder.userId !== userId) {
            throw new ForbiddenException(`Order with id ${orderId} does not belong to user ${userId}`);
        }

        const updatedOrder = await this.updateOrderPaymentStatus(convertDecimalsToNumbers(foundOrder));

        return convertDecimalsToNumbers(updatedOrder);
    }

    async findOrdersWithDetailsByUserId(userId: number): Promise<Order[]> {
        const orders = await this.ordersRepository.findAllWithDetailsByUserId(userId);

        // Параллельная актуализация заказов
        const updatedOrders = await Promise.all(
            orders.map(order => this.updateOrderPaymentStatus(convertDecimalsToNumbers(order))),
        );

        return updatedOrders.map(convertDecimalsToNumbers);
    }
}
