import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items/order-items.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, SERIALIZATION_GROUPS } from './entities/order.entity';
import { TicketsService } from '../tickets/tickets.service';
import { plainToInstance } from 'class-transformer';
import { PaymentStatus, Prisma, TicketStatus } from '@prisma/client';
import { Ticket } from '../tickets/entities/ticket.entity';
import { DatabaseService } from '../../db/database.service';
import { convertDecimalsToNumbers } from '../../common/utils/convert-decimal-to-number.utils';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { TicketsRepository } from '../tickets/tickets.repository';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../../email/email.service';
import { TicketGenerationService } from '../tickets/ticket-generation.service';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { EventEmitter2 } from '@nestjs/event-emitter';


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
        private readonly ticketGenerationService: TicketGenerationService,
        private readonly userService: UsersService,
        private readonly emailService: EmailService,
        private readonly eventEmitter: EventEmitter2,
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

                    if (promoCode) {
                        foundPromoCode = await this.promoCodesService.validatePromoCode({ eventId, code: promoCode }, true);

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
                        });
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

                    const finalOrder = await this.ordersRepository.findById(createdOrder.id, tx);

                    if (!finalOrder) {
                        throw new NotFoundException();
                    }

                    const transformedOrder = convertDecimalsToNumbers(finalOrder);

                    return transformedOrder as Order;
                },
                {
                    maxWait: 5000,
                    timeout: 10000,
                },
            );

            this.eventEmitter.emit('order.created', {
                orderId: createdOrderData.id,
                userId: createdOrderData.userId,
                // @ts-ignore
                eventId: createdOrderData?.orderItems[0]?.ticket?.event?.id
            });

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
            order.paymentStatus === PaymentStatus.REFUNDED
        ) {
            return order;
        }

        try {
            const paymentIntentResponse = await this.stripe.paymentIntents.retrieve(
                order.paymentIntentId
            );

            const refundsResponse = await this.stripe.refunds.list({
                payment_intent: order.paymentIntentId,
            });

            const paymentIntent: PaymentIntentWithRefunds = {
                ...paymentIntentResponse,
                refunds: refundsResponse.object === 'list' ? refundsResponse : null,
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
                    case 'processing':
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

            if (newStatus !== order.paymentStatus) {
                let updatedOrder = await this.db.$transaction(
                    async (txClient) => {
                        const prismaClient = tx || txClient;
                        let updatedOrder = await this.ordersRepository.update(
                            order.id,
                            {
                                paymentStatus: newStatus,
                            },
                            prismaClient,
                        );

                        if (newStatus === PaymentStatus.PAID && !order.invoiceId) {
                            try {
                                const user: User = await this.userService.findUserById(order.userId);

                                const customers = await this.stripe.customers.list({
                                    email: user.email,
                                    limit: 1,
                                });

                                let customerId: string;
                                if (customers.data.length > 0) {
                                    customerId = customers.data[0].id;
                                } else {
                                    const newCustomer = await this.stripe.customers.create({
                                        email: user.email,
                                        name: user.firstName,
                                    });
                                    customerId = newCustomer.id;
                                }

                                const invoice = await this.stripe.invoices.create({ // TODO: создавать это в другом месте
                                    customer: customerId,
                                    days_until_due: 30,
                                    collection_method: 'send_invoice',
                                    auto_advance: false,
                                    description: `Invoice for order #${order.id}`,
                                    metadata: { orderId: order.id.toString() },
                                });

                                const foundOrderWithDetails = await this.ordersRepository.findById(order.id);

                                if(!foundOrderWithDetails){
                                    throw new NotFoundException(`Order with ${order.id} not found`);
                                }

                                if (order.items) {
                                    for (const item of foundOrderWithDetails.orderItems) {
                                        await this.stripe.invoiceItems.create({
                                            invoice: invoice.id,
                                            customer: customerId,
                                            amount: Math.round(Number(item.finalPrice) * 100),
                                            currency: 'usd',
                                            description: item.ticket.title,
                                            metadata: { ticketId: item.ticket.id.toString() },
                                        });
                                    }
                                }

                                const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(String(invoice.id));

                                updatedOrder = await this.ordersRepository.update(
                                    order.id,
                                    { invoiceId: finalizedInvoice.id },
                                    prismaClient,
                                );



                                const generatedTicketsInfo: { itemId: number; key: string; path: string }[] = [];
                                const fullOrderDetails = await this.ordersRepository.findById(order.id, tx); // Нужен метод, возвращающий ВСЕ данные

                                if (!fullOrderDetails || !fullOrderDetails.orderItems) {
                                    throw new InternalServerErrorException(`Could not retrieve full order details for ${order.id}`);
                                }

                                for (const item of fullOrderDetails.orderItems) {
                                    if (item.ticketFileKey) {
                                        // Возможно, стоит добавить путь существующего файла, если нужно отправить email повторно
                                        // const existingFilePath = this.constructTicketPath(item); // Нужна функция для сборки пути
                                        // generatedTicketsInfo.push({ itemId: item.id, key: item.ticketFileKey, path: existingFilePath });
                                        continue;
                                    }

                                    const generationData = { orderItem: {...item, orderId: order.id, user: user} };
                                    const { ticketFileKey, filePath } = await this.ticketGenerationService.generateTicket(convertDecimalsToNumbers(generationData));

                                    await this.orderItemsRepository.update(item.id, { ticketFileKey: ticketFileKey }, tx)
                                    generatedTicketsInfo.push({ itemId: item.id, key: ticketFileKey, path: filePath });
                                }

                                const ticketLinks = generatedTicketsInfo.map(info => ({
                                    itemId: info.itemId,
                                    ticketTitle: fullOrderDetails.orderItems.find(item => item.id === info.itemId)?.ticket.title || 'Unknown Ticket',
                                    link: info.path,
                                }));

                                this.emailService.sendTicketConfirmationEmail(
                                    user.email,
                                    fullOrderDetails,
                                    ticketLinks,
                                    user.firstName || 'Customer',
                                );

                                await this.stripe.invoices.sendInvoice(String(finalizedInvoice.id));
                            } catch (invoiceError) {
                                console.error(`Failed to create invoice for order ${order.id}: ${invoiceError.message}`);
                            }
                        }

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

        if (foundOrder.userId !== userId) { //TODO: in guards
            throw new ForbiddenException(`Order with id ${orderId} does not belong to user ${userId}`);
        }

        return await this.updateOrderPaymentStatus(convertDecimalsToNumbers(foundOrder));
    }

    async findOrdersWithDetailsByUserId(userId: number): Promise<Order[]> {
        const orders = await this.ordersRepository.findAllWithDetailsByUserId(userId);

        const updatedOrders = await Promise.all(
            orders.map(order => this.updateOrderPaymentStatus(convertDecimalsToNumbers(order))),
        );

        return updatedOrders;
    }


    async getTicketFileStream(orderId: number, itemId: number): Promise<{ fileStream: fs.ReadStream, downloadFileName: string }> {
        const order = await this.ordersRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found.`);
        }

        const orderItem = order.orderItems?.find(item => item.id === itemId);
        if (!orderItem) {
            throw new NotFoundException(`Order Item with ID ${itemId} not found in Order ${orderId}.`);
        }

        if (order.paymentStatus !== PaymentStatus.PAID) {
            throw new ForbiddenException('Ticket cannot be viewed until the payment is completed.');
        }

        if (!orderItem.ticketFileKey) {
            throw new NotFoundException('Ticket PDF has not been generated for this item yet.');
        }

        const ticket = orderItem.ticket;
        const eventId = ticket.event.id;
        const eventTitle = ticket.event.title;

        const storagePath = String(
            this.configService.get<string>('storage.paths.tickets'),
        );
        const fileName = `item_${itemId}_${orderItem.ticketFileKey}.pdf`;
        const relativePath = path.join(`event_${eventId}`, `order_${orderId}`, fileName);
        const filePath = path.join(storagePath, relativePath);

        if (!fs.existsSync(filePath)) {
            throw new InternalServerErrorException('Ticket file cannot be retrieved at the moment. Please contact support.');
        }

        const fileStream = fs.createReadStream(filePath);
        const downloadFileName = `Ticket_${eventTitle.replace(/\s+/g, '_')}_${orderItem.ticketFileKey.substring(0, 8)}.pdf`;

        return { fileStream, downloadFileName };
    }
}
