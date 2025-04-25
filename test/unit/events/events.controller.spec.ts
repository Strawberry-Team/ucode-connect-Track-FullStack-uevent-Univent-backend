// test/unit/events/events.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../../../src/models/events/events.controller';
import { EventsService } from '../../../src/models/events/events.service';
import { Event, EventWithRelations } from '../../../src/models/events/entities/event.entity';
import { CreateEventDto } from '../../../src/models/events/dto/create-event.dto';
import { UpdateEventDto } from '../../../src/models/events/dto/update-event.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { generateFakeBasicEvent, generateFakeEventWithRelations, generateFakeCreateEventDto, generateFakeUpdateEventDto } from '../../fake-data/fake-events';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../../src/models/auth/guards/auth.guards';
import { CompanyOwnerGuard } from '../../../src/models/companies/guards/company-owner.guard';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { NewsService } from '../../../src/models/news/news.service';
import { TicketsService } from '../../../src/models/tickets/tickets.service';
import { PromoCodesService } from '../../../src/models/promo-codes/promo-codes.service';
import { EventAttendeesService } from '../../../src/models/events/event-attendees/event-attendees.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from '../../../src/models/subscriptions/subscriptions.service';
import { UsersService } from '../../../src/models/users/users.service';
import { CreateEventThemesDto, EventThemeDto } from '../../../src/models/events/dto/create-event-themes.dto';
import { EventAttendee } from '../../../src/models/events/event-attendees/entities/event-attendee.entities';
import { News } from '../../../src/models/news/entities/news.entity';
import { Ticket } from '../../../src/models/tickets/entities/ticket.entity';
import { PromoCode } from '../../../src/models/promo-codes/entities/promo-code.entity';
import { FindAllTicketsQueryDto } from '../../../src/models/tickets/dto/find-all-tickets-query.dto';
import { TicketStatus } from '@prisma/client';
import { generateFakeCreateNewsDto } from 'test/fake-data/fake-news';

class MockJwtAuthGuard {
    canActivate() {
        return true;
    }
}

// TODO: Додати тести для перевірки роботи декораторів контролера:
// - @UseGuards
// - @UsePipes
// - @UseInterceptors
// - @SerializeOptions

// TODO: Додати тести для перевірки роботи валідації DTO:
// - Перевірка обов'язкових полів
// - Перевірка типів даних
// - Перевірка обмежень (min/max значення, формати, тощо)

jest.mock('../../../src/models/auth/guards/auth.guards', () => ({
    JwtAuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: jest.fn().mockReturnValue(true),
    })),
}));

describe('EventsController', () => {
    let controller: EventsController;
    let eventsService: EventsService;
    let subscriptionsService: SubscriptionsService;
    let eventAttendeesService: EventAttendeesService;
    let promoCodesService: PromoCodesService;
    let ticketsService: TicketsService;
    let newsService: NewsService;
    let companiesService: CompaniesService;

    // Мок даних для базової події (без відносин)
    const fakeBasicEvent: Event = generateFakeBasicEvent();

    // Мок даних для події з відносинами
    const fakeEventWithRelations: EventWithRelations = generateFakeEventWithRelations();

    const fakeCreateEventDto: CreateEventDto = generateFakeCreateEventDto();
    const fakeUpdateEventDto: UpdateEventDto = generateFakeUpdateEventDto();

    // Трансформуємо дані для очікуваних результатів (без системних полів)
    const transformedBasicEvent = plainToInstance(Event, fakeBasicEvent, {
        excludeExtraneousValues: true,
        groups: ['basic']
    });

    const transformedEventWithRelations = plainToInstance(Event, fakeEventWithRelations, {
        excludeExtraneousValues: true,
        groups: ['basic']
    });

    const mockFrontUrl = 'http://localhost:3000';

    // TODO: Додати тестові дані для перевірки різних HTTP статусів
    // const invalidCreateEventDto = { ...fakeCreateEventDto, title: '' };
    // const unauthorizedUser = { id: -1 };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(transformedEventWithRelations),
                        create: jest.fn().mockResolvedValue(transformedBasicEvent),
                        findAll: jest.fn().mockResolvedValue({
                            items: [transformedEventWithRelations],
                            count: 1,
                            total: 1,
                            minPrice: 100,
                            maxPrice: 500
                        }),
                        update: jest.fn().mockImplementation((id) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve(transformedBasicEvent);
                        }),
                        delete: jest.fn().mockImplementation((id) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({ message: 'Event successfully deleted' });
                        }),
                        syncThemes: jest.fn().mockImplementation((id) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve(transformedEventWithRelations);
                        }),
                        updatePoster: jest.fn().mockImplementation((id) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({ server_filename: 'test-poster.jpg' });
                        }),
                    },
                },
                {
                    provide: CompaniesService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: NewsService,
                    useValue: {
                        create: jest.fn().mockImplementation((dto, userId, companyId, eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({
                                id: 1,
                                ...dto,
                                authorId: userId,
                                companyId,
                                eventId,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }),
                        findByEventId: jest.fn().mockImplementation((eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve([]);
                        }),
                    },
                },
                {
                    provide: TicketsService,
                    useValue: {
                        createTickets: jest.fn().mockImplementation((dto, eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve([{
                                id: 1,
                                eventId,
                                title: dto.title,
                                number: 'T001',
                                price: dto.price,
                                status: TicketStatus.AVAILABLE,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }]);
                        }),
                        findAllTickets: jest.fn().mockImplementation(({ eventId }) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({
                                items: [],
                                total: 0
                            });
                        }),
                        findOneTicket: jest.fn().mockImplementation((ticketId, eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            if (ticketId === -1) throw new NotFoundException('Ticket not found');
                            return Promise.resolve({
                                id: ticketId,
                                eventId,
                                title: 'Test Ticket',
                                number: 'T001',
                                price: 100,
                                status: TicketStatus.AVAILABLE,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }),
                    },
                },
                {
                    provide: PromoCodesService,
                    useValue: {
                        create: jest.fn().mockImplementation((dto, eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({
                                id: 1,
                                eventId,
                                title: dto.title,
                                code: dto.code,
                                discountPercent: dto.discountPercent,
                                isActive: dto.isActive,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }),
                        findAllByEventId: jest.fn().mockImplementation((eventId) => {
                            if (eventId === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve([{
                                id: 1,
                                eventId,
                                title: 'Summer Sale',
                                code: 'SUMMER2024',
                                discountPercent: 0.2,
                                isActive: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }]);
                        }),
                    },
                },
                {
                    provide: EventAttendeesService,
                    useValue: {
                        create: jest.fn().mockResolvedValue({
                            id: 1,
                            eventId: 1,
                            userId: 1,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }),
                        findByEventId: jest.fn().mockResolvedValue([]),
                        countByEventId: jest.fn().mockResolvedValue(0),
                        getEventAttendees: jest.fn().mockImplementation((id, userId) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve([
                                { id: 1, userId: 1, eventId: 1 },
                                { id: 2, userId: 2, eventId: 1 },
                            ] as unknown as EventAttendee[]);
                        }),
                    },
                },
                {
                    provide: SubscriptionsService,
                    useValue: {
                        create: jest.fn().mockResolvedValue({
                            id: 1,
                            eventId: 1,
                            userId: 1,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }),
                        findByCompanyId: jest.fn().mockResolvedValue([]),
                        getSubscriptionInfo: jest.fn().mockImplementation((type, id, userId) => {
                            if (id === -1) throw new NotFoundException('Event not found');
                            return Promise.resolve({
                                isSubscribed: true,
                                subscribersCount: 10,
                            });
                        }),
                    },
                },
                {
                    provide: CompanyOwnerGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(mockFrontUrl),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn().mockReturnValue(true),
                        getAllAndOverride: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        })
        .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
        .overrideGuard(CompanyOwnerGuard).useValue({ canActivate: () => true })
        .compile();

        controller = module.get<EventsController>(EventsController);
        eventsService = module.get<EventsService>(EventsService);
        subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
        eventAttendeesService = module.get<EventAttendeesService>(EventAttendeesService);
        promoCodesService = module.get<PromoCodesService>(PromoCodesService);
        ticketsService = module.get<TicketsService>(TicketsService);
        newsService = module.get<NewsService>(NewsService);
        companiesService = module.get<CompaniesService>(CompaniesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Event', () => {
        // TODO: Додати тести для перевірки HTTP статусів (201, 400, 401, 403)
        // TODO: Додати тести для перевірки заголовків відповіді
        // TODO: Додати тести для перевірки роботи ValidationPipe

        it('Should create an event and return basic fields', async () => {
            const result = await controller.create(fakeCreateEventDto);
            expect(result).toEqual(transformedBasicEvent);
            expect(eventsService.create).toHaveBeenCalledWith(fakeCreateEventDto);
        });
    });

    describe('Find All Events', () => {
        it('should return all events', async () => {
            const expectedResponse = {
                items: [transformedEventWithRelations],
                count: 1,
                total: 1,
                minPrice: 100,
                maxPrice: 500
            };
            jest.spyOn(eventsService, 'findAll').mockResolvedValue(expectedResponse);

            const result = await controller.findAll({});
            expect(result).toEqual(expectedResponse);
            expect(eventsService.findAll).toHaveBeenCalledWith({});
        });

        it('should return empty array when no events exist', async () => {
            const expectedResponse = {
                items: [],
                count: 0,
                total: 0,
                minPrice: null,
                maxPrice: null
            };
            jest.spyOn(eventsService, 'findAll').mockResolvedValue(expectedResponse);

            const result = await controller.findAll({});
            expect(result).toEqual(expectedResponse);
            expect(eventsService.findAll).toHaveBeenCalledWith({});
        });
    });

    describe('Find One Event', () => {
        it('Should return an event with relations by ID', async () => {
            const result = await controller.findOne(fakeEventWithRelations.id);
            expect(result).toEqual(transformedEventWithRelations);
            expect(eventsService.findById).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findOne(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Update Event', () => {
        it('Should update an event and return basic fields', async () => {
            const result = await controller.update(fakeBasicEvent.id, fakeUpdateEventDto);
            expect(result).toEqual(transformedBasicEvent);
            expect(eventsService.update).toHaveBeenCalledWith(fakeBasicEvent.id, fakeUpdateEventDto);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.update(-1, fakeUpdateEventDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Delete Event', () => {
        it('Should delete an event', async () => {
            await controller.delete(fakeEventWithRelations.id);
            expect(eventsService.delete).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.delete(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Sync Event Themes', () => {
        const fakeThemesDto = {
            themes: [1, 2, 3] as unknown as EventThemeDto[],
        } as CreateEventThemesDto;

        it('Should sync event themes successfully', async () => {
            await controller.syncThemes(fakeEventWithRelations.id, fakeThemesDto);
            expect(eventsService.syncThemes).toHaveBeenCalledWith(fakeEventWithRelations.id, fakeThemesDto);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.syncThemes(-1, fakeThemesDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Upload Event Poster', () => {
        const mockFile = {
            filename: 'test-poster.jpg',
            originalname: 'poster.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
        } as Express.Multer.File;

        it('Should upload poster successfully', async () => {
            const result = await controller.updatePoster(fakeEventWithRelations.id, mockFile);
            expect(result).toEqual({ server_filename: mockFile.filename });
            expect(eventsService.updatePoster).toHaveBeenCalledWith(fakeEventWithRelations.id, mockFile.filename);
        });

        it('Should throw BadRequestException when file is missing', async () => {
            await expect(controller.updatePoster(fakeEventWithRelations.id, null as unknown as Express.Multer.File)).rejects.toThrow(BadRequestException);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.updatePoster(-1, mockFile)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event Subscription Info', () => {
        const mockSubscriptionInfo = {
            isSubscribed: true,
            subscribersCount: 10,
        };

        it('Should return subscription info for authenticated user', async () => {
            const result = await controller.getSubscriptionInfo(fakeEventWithRelations.id, 1);
            expect(result).toEqual(mockSubscriptionInfo);
            expect(subscriptionsService.getSubscriptionInfo).toHaveBeenCalledWith('event', fakeEventWithRelations.id, 1);
        });

        it('Should return subscription info for unauthenticated user', async () => {
            const result = await controller.getSubscriptionInfo(fakeEventWithRelations.id, null);
            expect(result).toEqual(mockSubscriptionInfo);
            expect(subscriptionsService.getSubscriptionInfo).toHaveBeenCalledWith('event', fakeEventWithRelations.id, null);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            await expect(controller.getSubscriptionInfo(-1, 1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event Attendees', () => {
        const mockAttendees = [
            { id: 1, userId: 1, eventId: 1 },
            { id: 2, userId: 2, eventId: 1 },
        ] as unknown as EventAttendee[];

        it('Should return event attendees for authenticated user', async () => {
            jest.spyOn(eventAttendeesService, 'getEventAttendees').mockResolvedValue(mockAttendees);
            const result = await controller.getEventAttendees(fakeEventWithRelations.id, 1);
            expect(result).toEqual(mockAttendees);
            expect(eventAttendeesService.getEventAttendees).toHaveBeenCalledWith(fakeEventWithRelations.id, 1);
        });

        it('Should return event attendees for unauthenticated user', async () => {
            jest.spyOn(eventAttendeesService, 'getEventAttendees').mockResolvedValue(mockAttendees);
            const result = await controller.getEventAttendees(fakeEventWithRelations.id, null);
            expect(result).toEqual(mockAttendees);
            expect(eventAttendeesService.getEventAttendees).toHaveBeenCalledWith(fakeEventWithRelations.id, null);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.getEventAttendees(-1, 1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event By Id (Public)', () => {
        it('Should return an event with relations by ID', async () => {
            const result = await controller.findOne(fakeEventWithRelations.id);
            expect(result).toEqual(transformedEventWithRelations);
            expect(eventsService.findById).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found (public endpoint)', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findOne(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Create Event News', () => {
        const fakeNewsDto = {
            title: 'Test News',
            description: 'Test Description'
        };

        it('Should create news for event', async () => {
            const mockNews: News = {
                id: 1,
                authorId: 1,
                companyId: null,
                eventId: fakeEventWithRelations.id,
                ...fakeNewsDto,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            jest.spyOn(newsService, 'create').mockResolvedValue(mockNews);

            const result = await controller.createNews(fakeEventWithRelations.id, fakeNewsDto, 1);
            expect(result).toEqual(mockNews);
            expect(newsService.create).toHaveBeenCalledWith(fakeNewsDto, 1, undefined, fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.createNews(-1, fakeNewsDto, 1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Create Event Tickets', () => {
        const fakeTicketDto = {
            title: 'VIP Ticket',
            price: 100,
            quantity: 10
        };

        it('Should create tickets for event', async () => {
            const mockTickets: Ticket[] = [
                {
                    id: 1,
                    eventId: fakeEventWithRelations.id,
                    number: 'T001',
                    status: TicketStatus.AVAILABLE,
                    title: fakeTicketDto.title,
                    price: fakeTicketDto.price,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    eventId: fakeEventWithRelations.id,
                    number: 'T002',
                    status: TicketStatus.AVAILABLE,
                    title: fakeTicketDto.title,
                    price: fakeTicketDto.price,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            jest.spyOn(ticketsService, 'createTickets').mockResolvedValue(mockTickets);

            const result = await controller.createTicket(fakeTicketDto, fakeEventWithRelations.id);
            expect(result).toEqual(mockTickets);
            expect(ticketsService.createTickets).toHaveBeenCalledWith(fakeTicketDto, fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.createTicket(fakeTicketDto, -1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event News', () => {
        const mockNews: News[] = [
            {
                id: 1,
                title: 'News 1',
                description: 'Description 1',
                authorId: 1,
                companyId: null,
                eventId: fakeEventWithRelations.id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                title: 'News 2',
                description: 'Description 2',
                authorId: 1,
                companyId: null,
                eventId: fakeEventWithRelations.id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        it('Should return all news for event', async () => {
            jest.spyOn(newsService, 'findByEventId').mockResolvedValue(mockNews);

            const result = await controller.findAllNews(fakeEventWithRelations.id);
            expect(result).toEqual(mockNews);
            expect(newsService.findByEventId).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findAllNews(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event Tickets', () => {
        const mockTickets = {
            items: [
                {
                    id: 1,
                    eventId: fakeEventWithRelations.id,
                    title: 'Ticket 1',
                    price: 100,
                    number: 'T001',
                    status: TicketStatus.AVAILABLE,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    eventId: fakeEventWithRelations.id,
                    title: 'Ticket 2',
                    price: 200,
                    number: 'T002',
                    status: TicketStatus.AVAILABLE,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ] as Ticket[],
            total: 2
        };

        const queryDto: FindAllTicketsQueryDto = {
            title: 'VIP',
            status: TicketStatus.AVAILABLE
        };

        it('Should return all tickets for event', async () => {
            jest.spyOn(ticketsService, 'findAllTickets').mockResolvedValue(mockTickets);

            const result = await controller.findAllTickets(fakeEventWithRelations.id, queryDto);
            expect(result).toEqual(mockTickets);
            expect(ticketsService.findAllTickets).toHaveBeenCalledWith({
                eventId: fakeEventWithRelations.id,
                ...queryDto
            });
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findAllTickets(-1, queryDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Specific Event Ticket', () => {
        const mockTicket: Ticket = {
            id: 1,
            eventId: fakeEventWithRelations.id,
            title: 'VIP Ticket',
            price: 100,
            number: 'T001',
            status: TicketStatus.AVAILABLE,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('Should return specific ticket for event', async () => {
            jest.spyOn(ticketsService, 'findOneTicket').mockResolvedValue(mockTicket);

            const result = await controller.findOneTicket(fakeEventWithRelations.id, mockTicket.id);
            expect(result).toEqual(mockTicket);
            expect(ticketsService.findOneTicket).toHaveBeenCalledWith(mockTicket.id, fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when ticket is not found', async () => {
            jest.spyOn(ticketsService, 'findOneTicket').mockRejectedValue(new NotFoundException('Ticket not found'));
            await expect(controller.findOneTicket(fakeEventWithRelations.id, -1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Create Event Promo Codes', () => {
        const fakePromoCodeDto = {
            title: 'Summer Sale',
            code: 'SUMMER2024',
            discountPercent: 0.2,
            isActive: true
        };

        it('Should create promo code for event', async () => {
            const mockPromoCode = {
                id: 1,
                eventId: fakeEventWithRelations.id,
                ...fakePromoCodeDto,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await controller.createPromoCode(fakePromoCodeDto, fakeEventWithRelations.id);
            expect(result).toEqual(expect.objectContaining({
                id: expect.any(Number),
                eventId: fakeEventWithRelations.id,
                title: fakePromoCodeDto.title,
                code: fakePromoCodeDto.code,
                discountPercent: fakePromoCodeDto.discountPercent,
                isActive: fakePromoCodeDto.isActive
            }));
        });

        it('Should throw NotFoundException when event is not found', async () => {
            await expect(controller.createPromoCode(fakePromoCodeDto, -1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event Promo Codes', () => {
        it('Should return all promo codes for event', async () => {
            const result = await controller.findAllPromoCodes(fakeEventWithRelations.id);
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    eventId: fakeEventWithRelations.id,
                    title: expect.any(String),
                    code: expect.any(String),
                    discountPercent: expect.any(Number),
                    isActive: expect.any(Boolean)
                })
            ]));
            expect(promoCodesService.findAllByEventId).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            await expect(controller.findAllPromoCodes(-1)).rejects.toThrow(NotFoundException);
        });
    });

    // TODO: Додати тести для перевірки обробки помилок від сервісу
    // TODO: Додати тести для перевірки роботи з файлами (якщо є)
    // TODO: Додати тести для перевірки кешування (якщо використовується)
});
