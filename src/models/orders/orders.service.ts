// src/models/orders/orders.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException, InternalServerErrorException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items/order-items.repository';
import { CreateOrderDto } from './dto/create-order.dto';
// import { FindAllOrdersQueryDto } from './dto/find-all-orders-query.dto';
import { Order } from './entities/order.entity';
import { TicketsService } from '../tickets/tickets.service';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from './entities/order.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import {Ticket} from "../tickets/entities/ticket.entity";
import {DatabaseService} from "../../db/database.service";
import {convertDecimalsToNumbers} from "../../common/utils/convert-decimal-to-number.utils";
import {PromoCodesService} from "../promo-codes/promo-codes.service";

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly orderItemsRepository: OrderItemsRepository,
        private readonly ticketsService: TicketsService,
        private readonly promoCodesService: PromoCodesService,
        private readonly db: DatabaseService,
    ) {}

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


    async getOrder(orderId: number, userId: number): Promise<Order> {
        const foundOrder = await this.ordersRepository.findById(orderId);

        if(!foundOrder){
            throw new NotFoundException(`Order with id ${orderId} not found`);
        }

        return convertDecimalsToNumbers(foundOrder);
    }

    async findOrdersWithDetailsByUserId(userId: number): Promise<Order[]> {
        const result: Order[] = convertDecimalsToNumbers(
            await this.ordersRepository.findAllWithDetailsByUserId(userId)
        );

        return result;

    }
}
