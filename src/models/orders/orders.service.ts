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
import { Prisma, TicketStatus } from '@prisma/client';
import {Ticket} from "../tickets/entities/ticket.entity";
import {DatabaseService} from "../../db/database.service";
import {convertDecimalsToNumbers} from "../../common/utils/convert-decimal-to-number.utils";

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly orderItemsRepository: OrderItemsRepository,
        private readonly ticketsService: TicketsService,
        private readonly db: DatabaseService
    ) {}

    async create(dto: CreateOrderDto, userId: number): Promise<Order> {
        const { eventId, promoCodeId, paymentMethod, items } = dto;

        try {
            const createdOrderData = await this.db.$transaction(
                async (tx) => {
                    const selectedTickets: Ticket[] = [];
                    const ticketIdsToReserve: number[] = [];
                    let totalAmount = new Prisma.Decimal(0);

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

                    selectedTickets.forEach((ticket) => {
                        // TODO: Apply the promo code logic here
                        const finalPrice = new Prisma.Decimal(ticket.price);
                        totalAmount = totalAmount.add(finalPrice);
                    });

                    const orderData = {
                        ...dto,
                        userId,
                        totalAmount,
                    };
                    const createdOrder = await this.ordersRepository.create(orderData, tx);

                    const orderItemsInputData = selectedTickets.map((ticket) => {
                        // TODO: Apply promo code logic for finalPrice
                        const finalPrice = new Prisma.Decimal(ticket.price);
                        return {
                            orderId: createdOrder.id,
                            ticketId: ticket.id,
                            initialPrice: new Prisma.Decimal(ticket.price),
                            finalPrice: finalPrice,
                        };
                    });

                    await this.orderItemsRepository.createMany(orderItemsInputData, tx);

                    // const finalOrder = await tx.order.findUniqueOrThrow({
                    //     where: { id: createdOrder.id },
                    //     include: { orderItems: true },
                    // });

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
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
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
}
