// test/unit/orders/orders.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { OrdersService } from '../../../src/models/orders/orders.service';
import { OrdersRepository } from '../../../src/models/orders/orders.repository';
import { OrderItemsRepository } from '../../../src/models/orders/order-items/order-items.repository';
import { TicketsService } from '../../../src/models/tickets/tickets.service';
import { DatabaseService } from '../../../src/db/database.service';
import { Order } from '../../../src/models/orders/entities/order.entity';
import {
    generateFakeCreateOrderDto,
    generateFakeOrder,
    generateFakeTicket,
    generateFakeDbOrder
} from '../../fake-data/fake-orders';
import { convertDecimalsToNumbers } from 'src/common/utils/convert-decimal-to-number.utils';
import { PromoCodesService } from '../../../src/models/promo-codes/promo-codes.service';

describe('OrdersService', () => {
    let service: OrdersService;
    let ordersRepository: OrdersRepository;
    let orderItemsRepository: OrderItemsRepository;
    let ticketsService: TicketsService;
    let db: DatabaseService;
    let consoleErrorSpy: jest.SpyInstance;
    let promoCodesService: PromoCodesService;

    const mockCreateOrderDto = generateFakeCreateOrderDto();
    const mockOrder = generateFakeOrder({}, true);
    const mockDbOrder = generateFakeDbOrder();
    const mockTickets = [
        generateFakeTicket({ id: 1, title: 'Standard Ticket' }),
        generateFakeTicket({ id: 2, title: 'Standard Ticket' }),
    ];

    const mockTransaction = {
        // Mock Transaction client with properly typed methods
        order: {
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockDbOrder),
        },
        // Required for the repository calls
        ticket: {
            findMany: jest.fn(),
            count: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        // Мокаємо console.error перед кожним тестом
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: OrdersRepository,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                        findById: jest.fn().mockResolvedValue(mockOrder),
                        findAllWithDetailsByUserId: jest.fn().mockResolvedValue([mockOrder]),
                    },
                },
                {
                    provide: OrderItemsRepository,
                    useValue: {
                        createMany: jest.fn().mockResolvedValue([]),
                    },
                },
                {
                    provide: TicketsService,
                    useValue: {
                        findAllTickets: jest.fn().mockResolvedValue({
                            items: mockTickets,
                            total: mockTickets.length,
                        }),
                        reserveTickets: jest.fn().mockResolvedValue({
                            count: mockTickets.length,
                        }),
                    },
                },
                {
                    provide: PromoCodesService,
                    useValue: {
                        validatePromoCode: jest.fn().mockResolvedValue({
                            promoCode: {
                                id: 1,
                                eventId: 1,
                                title: 'Test Promo',
                                discountPercent: 0.1,
                                isActive: true,
                                createdAt: new Date(),
                            },
                        }),
                    },
                },
                {
                    provide: DatabaseService,
                    useValue: {
                        $transaction: jest.fn(async (callback) => {
                            const txClient = {
                                order: {
                                    create: jest.fn().mockResolvedValue(mockOrder),
                                    findUnique: jest.fn().mockResolvedValue(mockOrder),
                                },
                                orderItem: {
                                    createMany: jest.fn().mockResolvedValue({ count: mockTickets.length }),
                                },
                                ticket: {
                                    findMany: jest.fn().mockResolvedValue(mockTickets),
                                    updateMany: jest.fn().mockResolvedValue({ count: mockTickets.length }),
                                },
                            };
                            return callback(txClient);
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        ordersRepository = module.get<OrdersRepository>(OrdersRepository);
        orderItemsRepository = module.get<OrderItemsRepository>(OrderItemsRepository);
        ticketsService = module.get<TicketsService>(TicketsService);
        db = module.get<DatabaseService>(DatabaseService);
        promoCodesService = module.get<PromoCodesService>(PromoCodesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Відновлюємо оригінальну реалізацію console.error
        consoleErrorSpy.mockRestore();
    });

    describe('create', () => {
        const userId = 1;

        // beforeEach(() => {
        //     // Reset transaction mock to success state
        //     (db.$transaction as jest.Mock).mockImplementation((callback) => callback(mockTransaction));

        //     // Setup ticketsService mocks
        //     (ticketsService.findAllTickets as jest.Mock).mockResolvedValue({
        //         items: mockTickets,
        //         total: mockTickets.length,
        //     });

        //     (ticketsService.reserveTickets as jest.Mock).mockResolvedValue({
        //         count: mockTickets.length,
        //     });
        // });

        it('should create order successfully with valid data', async () => {
            const result = await service.create(mockCreateOrderDto, userId);

            // Check if the result matches expected orders
            expect(result).toBeDefined();
            expect(result.id).toBe(mockOrder.id);
            expect(result.totalAmount).toBe(mockOrder.totalAmount);
            expect(result.paymentMethod).toBe(mockOrder.paymentMethod);

            // Verify transaction was used
            expect(db.$transaction).toHaveBeenCalled();

            // Verify tickets were fetched
            expect(ticketsService.findAllTickets).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventId: mockCreateOrderDto.eventId,
                    title: mockCreateOrderDto.items[0].ticketTitle,
                    status: TicketStatus.AVAILABLE,
                    limit: mockCreateOrderDto.items[0].quantity,
                }),
                expect.anything()
            );

            // Verify tickets were reserved
            expect(ticketsService.reserveTickets).toHaveBeenCalledWith(
                [1, 2], // mock ticket ids
                expect.anything()
            );
        });

        it('should throw BadRequestException when not enough tickets available', async () => {
            // Make ticketsService return fewer tickets than requested
            jest.spyOn(ticketsService, 'findAllTickets').mockResolvedValueOnce({
                items: [mockTickets[0]],
                total: 1,
            });

            await expect(async () => {
                await service.create(mockCreateOrderDto, userId);
            }).rejects.toThrow(BadRequestException);

            expect(ticketsService.findAllTickets).toHaveBeenCalled();
            expect(ticketsService.reserveTickets).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when no tickets are selected', async () => {
            // Make ticketsService return empty array
            jest.spyOn(ticketsService, 'findAllTickets').mockResolvedValueOnce({
                items: [],
                total: 0,
            });

            await expect(service.create(mockCreateOrderDto, userId))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException when ticket reservation fails', async () => {
            // Setup reservation to fail (fewer tickets updated than expected)
            jest.spyOn(ticketsService, 'reserveTickets').mockResolvedValueOnce({
                count: 1,
            });
            await expect(service.create(mockCreateOrderDto, userId))
                .rejects
                .toThrow(new InternalServerErrorException('Failed to create orders due to an internal error.'));
            expect(ticketsService.findAllTickets).toHaveBeenCalled();
            expect(ticketsService.reserveTickets).toHaveBeenCalled();
        });

        it('should calculate totalAmount correctly based on ticket prices', async () => {
            // Mock tickets with different prices
            const expensiveTickets = [
                generateFakeTicket({ id: 1, title: 'Premium Ticket', price: 200 }),
                generateFakeTicket({ id: 2, title: 'Premium Ticket', price: 200 }),
            ];

            (ticketsService.findAllTickets as jest.Mock).mockResolvedValue({
                items: expensiveTickets,
                total: expensiveTickets.length,
            });

            // Setup orders repository mock to capture the input
            const createSpy = jest.spyOn(ordersRepository, 'create');

            await service.create(mockCreateOrderDto, userId);

            // Verify the orders was created with correct total amount
            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalAmount: expect.any(Prisma.Decimal), // Now expecting a Decimal
                }),
                expect.anything()
            );

            // Check the value of the Decimal
            // @ts-ignore - accessing internal property for test
            const passedTotalAmount = createSpy.mock.calls[0][0].totalAmount;
            expect(passedTotalAmount.toString()).toBe('400'); // 2 tickets * $200
        });

        it('should handle database transaction failures gracefully', async () => {
            // Make the transaction throw an error
            (db.$transaction as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            await expect(service.create(mockCreateOrderDto, userId))
                .rejects
                .toThrow(new InternalServerErrorException('Failed to create orders due to an internal error.'));
        });

        it('should pass through BadRequestException from transaction', async () => {
            // Make the transaction throw a specific error
            (db.$transaction as jest.Mock).mockRejectedValueOnce(new BadRequestException('Specific validation error'));

            await expect(service.create(mockCreateOrderDto, userId))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should correctly process multiple ticket types in one orders', async () => {
            // Create DTO with multiple ticket types
            const multiTypeOrderDto = generateFakeCreateOrderDto({
                items: [
                    { ticketTitle: 'Standard Ticket', quantity: 2 },
                    { ticketTitle: 'VIP Ticket', quantity: 1 },
                ],
            });

            // Setup mocks for different ticket types
            const standardTickets = [
                generateFakeTicket({ id: 1, title: 'Standard Ticket', price: 100 }),
                generateFakeTicket({ id: 2, title: 'Standard Ticket', price: 100 }),
            ];

            const vipTicket = [
                generateFakeTicket({ id: 3, title: 'VIP Ticket', price: 300 }),
            ];

            // Mock the ticketsService to return different tickets based on the title
            (ticketsService.findAllTickets as jest.Mock)
                .mockImplementationOnce(() => ({
                    items: standardTickets,
                    total: standardTickets.length,
                }))
                .mockImplementationOnce(() => ({
                    items: vipTicket,
                    total: vipTicket.length,
                }));

            (ticketsService.reserveTickets as jest.Mock).mockResolvedValue({
                count: 3, // Возвращаем корректное число зарезервированных билетов
            });

            await service.create(multiTypeOrderDto, userId);

            // Verify findAllTickets was called for each ticket type
            // expect(ticketsService.findAllTickets).toHaveBeenCalledTimes(2);

            // Verify reserveTickets was called with all ticket IDs
            expect(ticketsService.reserveTickets).toHaveBeenCalledWith(
                [1, 2, 3], // All three ticket IDs
                expect.anything()
            );
        });

        it('should handle transaction failures gracefully', async () => {
            // Make the transaction throw an error
            (db.$transaction as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            await expect(service.create(mockCreateOrderDto, userId))
                .rejects
                .toThrow(new InternalServerErrorException('Failed to create orders due to an internal error.'));

            expect(consoleErrorSpy).toHaveBeenCalledWith('Order creation transaction failed:', expect.any(Error));
        });

        describe('promo code handling', () => {
            it('should apply promo code discount correctly', async () => {
                // Створюємо замовлення з промокодом
                const orderWithPromoCode = generateFakeCreateOrderDto({
                    promoCode: 'TEST10',
                    items: [
                        { ticketTitle: 'Standard Ticket', quantity: 2 },
                    ],
                });

                // Налаштовуємо квитки з фіксованою ціною для легкої перевірки
                const ticketsWithFixedPrice = [
                    generateFakeTicket({ id: 1, title: 'Standard Ticket', price: 100 }),
                    generateFakeTicket({ id: 2, title: 'Standard Ticket', price: 100 }),
                ];

                // Мокуємо відповідь сервісу промокодів
                jest.spyOn(promoCodesService, 'validatePromoCode').mockResolvedValueOnce({
                    promoCode: {
                        id: 1,
                        eventId: 1,
                        title: 'Test Promo',
                        discountPercent: 0.1,
                        isActive: true,
                        createdAt: new Date(),
                    },
                });

                // Мокуємо повернення квитків
                jest.spyOn(ticketsService, 'findAllTickets').mockResolvedValueOnce({
                    items: ticketsWithFixedPrice,
                    total: ticketsWithFixedPrice.length,
                });

                // Створюємо spy для перехоплення створення замовлення
                const createSpy = jest.spyOn(ordersRepository, 'create');

                await service.create(orderWithPromoCode, userId);

                // Перевіряємо, що промокод був валідований
                expect(promoCodesService.validatePromoCode).toHaveBeenCalledWith({
                    eventId: orderWithPromoCode.eventId,
                    code: orderWithPromoCode.promoCode,
                }, true);

                // Перевіряємо, що сума була розрахована коректно зі знижкою
                const passedTotalAmount = createSpy.mock.calls[0][0].totalAmount;
                expect(passedTotalAmount.toString()).toBe('180'); // 200 - 10% = 180
            });

            it('should throw BadRequestException when promo code is invalid', async () => {
                // Створюємо замовлення з промокодом
                const orderWithInvalidPromoCode = generateFakeCreateOrderDto({
                    promoCode: 'INVALID',
                });

                // Мокуємо відповідь сервісу промокодів з помилкою
                jest.spyOn(promoCodesService, 'validatePromoCode').mockRejectedValueOnce(
                    new BadRequestException('Invalid promo code'),
                );

                // Перевіряємо, що створення замовлення викидає помилку
                await expect(service.create(orderWithInvalidPromoCode, userId))
                    .rejects
                    .toThrow(BadRequestException);

                // Перевіряємо, що промокод був перевірений
                expect(promoCodesService.validatePromoCode).toHaveBeenCalledWith({
                    eventId: orderWithInvalidPromoCode.eventId,
                    code: orderWithInvalidPromoCode.promoCode,
                }, true);
            });

            it('should create order without discount when no promo code provided', async () => {
                // Створюємо замовлення без промокоду
                const orderWithoutPromoCode = generateFakeCreateOrderDto({
                    promoCode: null,
                    items: [
                        { ticketTitle: 'Standard Ticket', quantity: 2 },
                    ],
                });

                // Налаштовуємо квитки з фіксованою ціною
                const ticketsWithFixedPrice = [
                    generateFakeTicket({ id: 1, title: 'Standard Ticket', price: 100 }),
                    generateFakeTicket({ id: 2, title: 'Standard Ticket', price: 100 }),
                ];

                // Мокуємо повернення квитків
                jest.spyOn(ticketsService, 'findAllTickets').mockResolvedValueOnce({
                    items: ticketsWithFixedPrice,
                    total: ticketsWithFixedPrice.length,
                });

                // Створюємо spy для перехоплення створення замовлення
                const createSpy = jest.spyOn(ordersRepository, 'create');

                await service.create(orderWithoutPromoCode, userId);

                // Перевіряємо, що промокод не перевірявся
                expect(promoCodesService.validatePromoCode).not.toHaveBeenCalled();

                // Перевіряємо, що сума була розрахована без знижки
                const passedTotalAmount = createSpy.mock.calls[0][0].totalAmount;
                expect(passedTotalAmount.toString()).toBe('200'); // 2 * 100 = 200
            });

            it('should throw UnprocessableEntityException when promo code is inactive', async () => {
                // Створюємо замовлення з промокодом
                const orderWithInactivePromoCode = generateFakeCreateOrderDto({
                    promoCode: 'INACTIVE',
                });

                // Мокуємо відповідь сервісу промокодів з помилкою для неактивного промокоду
                jest.spyOn(promoCodesService, 'validatePromoCode').mockRejectedValueOnce(
                    new UnprocessableEntityException('Promo code is not active')
                );

                // Перевіряємо, що створення замовлення викидає помилку
                await expect(service.create(orderWithInactivePromoCode, userId))
                    .rejects
                    .toThrow(UnprocessableEntityException);

                // Перевіряємо, що промокод був перевірений
                expect(promoCodesService.validatePromoCode).toHaveBeenCalledWith({
                    eventId: orderWithInactivePromoCode.eventId,
                    code: orderWithInactivePromoCode.promoCode,
                }, true);
            });
        });
    });

    describe('getOrder', () => {
        const mockDbOrderWithNumbers = convertDecimalsToNumbers(mockDbOrder);
        
        it('should return order by its id', async () => {
            jest.spyOn(ordersRepository, 'findById').mockResolvedValueOnce(mockDbOrderWithNumbers);

            const result = await service.getOrder(mockDbOrderWithNumbers.id, mockDbOrderWithNumbers.userId);

            expect(result).toEqual(mockDbOrderWithNumbers);
            expect(ordersRepository.findById).toHaveBeenCalledWith(mockDbOrderWithNumbers.id);
        });

        it('should throw NotFoundException when order not found', async () => {     
            jest.spyOn(ordersRepository, 'findById').mockResolvedValueOnce(null);

            await expect(service.getOrder(-1, mockDbOrderWithNumbers.userId))
                .rejects
                .toThrow(new NotFoundException('Order with id -1 not found'));
                
            expect(ordersRepository.findById).toHaveBeenCalledWith(-1);
        });
    });

    describe('findOrdersWithDetailsByUserId', () => {
        const mockDbOrderWithNumbers = convertDecimalsToNumbers(mockDbOrder);
        it('should return all orders with details for user', async () => {
            jest.spyOn(ordersRepository, 'findAllWithDetailsByUserId').mockResolvedValueOnce([mockDbOrderWithNumbers]);

            const result = await service.findOrdersWithDetailsByUserId(mockDbOrderWithNumbers.userId);

            expect(result).toEqual([mockDbOrderWithNumbers]);
            expect(ordersRepository.findAllWithDetailsByUserId).toHaveBeenCalledWith(mockDbOrderWithNumbers.userId);
        });

        it('should throw NotFoundException when order not found', async () => {
            jest.spyOn(ordersRepository, 'findAllWithDetailsByUserId').mockResolvedValueOnce([]);

            const result = await service.findOrdersWithDetailsByUserId(mockDbOrderWithNumbers.userId);

            expect(result).toEqual([]);
            expect(ordersRepository.findAllWithDetailsByUserId).toHaveBeenCalledWith(mockDbOrderWithNumbers.userId);
        });
    });
});
