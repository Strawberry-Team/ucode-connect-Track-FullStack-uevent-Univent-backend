// test/unit/events/events.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../../../src/models/events/events.service';
import { EventsRepository } from '../../../src/models/events/events.repository';
import { Event, EventWithRelations } from '../../../src/models/events/entities/event.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateEventDto } from '../../../src/models/events/dto/create-event.dto';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { generateFakeBasicEvent, generateFakeEventWithRelations, generateFakeCreateEventDto } from '../../fake-data/fake-events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompaniesRepository } from '../../../src/models/companies/companies.repository';

// TODO: Додати тести для перевірки бізнес-логіки, наприклад:
// - Перевірка зміни статусу події при різних умовах
// - Перевірка валідації дат (startedAt < endedAt)
// - Перевірка логіки публікації події

// TODO: Додати тести для обробки граничних випадків:
// - Некоректні дати
// - Некоректні ID зв'язаних сутностей
// - Порожні або невалідні значення полів

// TODO: Додати тести для перевірки взаємодії з іншими сервісами, якщо вони є
// (наприклад, сервіс завантаження файлів для posterName)

describe('EventsService', () => {
    let service: EventsService;
    let repository: EventsRepository;
    let eventEmitter: EventEmitter2;
    let companiesRepository: CompaniesRepository;

    // Мок даних, які повертає репозиторій (з системними полями)
    const mockRepositoryEvent: Event = generateFakeBasicEvent();

    // Мок даних з відносинами, які повертає репозиторій
    const mockRepositoryEventWithRelations: EventWithRelations = generateFakeEventWithRelations();

    const mockCreateEventDto: CreateEventDto = generateFakeCreateEventDto();

    // TODO: Додати більше варіацій тестових даних для різних сценаріїв
    // const mockEventWithPastDates = generateFakeBasicEvent({ withPastDates: true });
    // const mockEventWithoutOptionalFields = generateFakeBasicEvent({ withOptionalFields: false });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                {
                    provide: EventsRepository,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockRepositoryEvent),
                        findById: jest.fn().mockResolvedValue(mockRepositoryEventWithRelations),
                        findByCompanyId: jest.fn().mockResolvedValue([mockRepositoryEventWithRelations]),
                        update: jest.fn().mockResolvedValue(mockRepositoryEvent),
                        delete: jest.fn().mockResolvedValue(undefined),
                        findAll: jest.fn().mockResolvedValue([mockRepositoryEventWithRelations]),
                        findAllWithTicketPrices: jest.fn().mockResolvedValue({
                            items: [mockRepositoryEventWithRelations],
                            count: 1,
                            total: 1,
                            minPrice: 100,
                            maxPrice: 500
                        }),
                    },
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
                {
                    provide: CompaniesRepository,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({ id: 1, name: 'Test Company' }),
                    },
                },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
        repository = module.get<EventsRepository>(EventsRepository);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        companiesRepository = module.get<CompaniesRepository>(CompaniesRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvent', () => {
        // TODO: Додати тести для перевірки валідації вхідних даних
        // TODO: Додати тести для перевірки обробки помилок від репозиторію
        // TODO: Додати тести для перевірки трансформації даних (вхідні -> збережені -> повернуті)

        it('should create event and return basic fields only', async () => {
            const result = await service.create(mockCreateEventDto);

            // Перевіряємо, що системні поля відсутні
            expect(result['createdAt']).toBeUndefined();
            expect(result['updatedAt']).toBeUndefined();

            // Перевіряємо, що всі basic поля присутні
            expect(result).toHaveProperty('id', mockRepositoryEvent.id);
            expect(result).toHaveProperty('title', mockRepositoryEvent.title);
            expect(result).toHaveProperty('description', mockRepositoryEvent.description);
            expect(result).toHaveProperty('venue', mockRepositoryEvent.venue);
            expect(result).toHaveProperty('locationCoordinates', mockRepositoryEvent.locationCoordinates);
            expect(result).toHaveProperty('startedAt', mockRepositoryEvent.startedAt);
            expect(result).toHaveProperty('endedAt', mockRepositoryEvent.endedAt);
            expect(result).toHaveProperty('publishedAt', mockRepositoryEvent.publishedAt);
            expect(result).toHaveProperty('ticketsAvailableFrom', mockRepositoryEvent.ticketsAvailableFrom);
            expect(result).toHaveProperty('posterName', mockRepositoryEvent.posterName);
            expect(result).toHaveProperty('attendeeVisibility', mockRepositoryEvent.attendeeVisibility);
            expect(result).toHaveProperty('status', mockRepositoryEvent.status);

            // Перевіряємо, що репозиторій був викликаний з правильними параметрами
            expect(repository.create).toHaveBeenCalledWith(mockCreateEventDto);
        });

        // TODO: Додати тест для перевірки автоматичного встановлення статусу PUBLISHED
        // при наявності publishedAt
    });

    describe('findById', () => {
        it('should return event with relations and basic fields only', async () => {
            const result = await service.findById(1);

            // Перевіряємо, що системні поля відсутні
            expect(result['createdAt']).toBeUndefined();
            expect(result['updatedAt']).toBeUndefined();

            // Перевіряємо наявність відносин
            expect(result).toHaveProperty('themes', mockRepositoryEventWithRelations.themes);
            expect(result).toHaveProperty('company', mockRepositoryEventWithRelations.company);
            expect(result).toHaveProperty('format', mockRepositoryEventWithRelations.format);

            // Перевіряємо basic поля
            expect(result).toHaveProperty('id', mockRepositoryEventWithRelations.id);
            expect(result).toHaveProperty('title', mockRepositoryEventWithRelations.title);

            expect(repository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when event not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);
            await expect(service.findById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update event and return basic fields only', async () => {
            const updateDto = { title: 'Updated Title' };
            const updatedEvent = { ...mockRepositoryEvent, ...updateDto };

            jest.spyOn(repository, 'update').mockResolvedValue(updatedEvent);

            const result = await service.update(1, updateDto);

            // Перевіряємо, що системні поля відсутні
            expect(result['createdAt']).toBeUndefined();
            expect(result['updatedAt']).toBeUndefined();

            // Перевіряємо оновлене поле
            expect(result).toHaveProperty('title', updateDto.title);

            // Перевіряємо, що інші поля залишились незмінними
            expect(result).toHaveProperty('id', mockRepositoryEvent.id);
            expect(result).toHaveProperty('description', mockRepositoryEvent.description);

            expect(repository.update).toHaveBeenCalledWith(1, expect.objectContaining(updateDto));
        });

        it('should throw NotFoundException when updating non-existent event', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);
            await expect(service.update(1, { title: 'Updated Title' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete event successfully', async () => {
            await service.delete(1);
            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when deleting non-existent event', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);
            await expect(service.delete(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return events with relations and basic fields only', async () => {
            const mockResponse = {
                items: [mockRepositoryEventWithRelations],
                count: 1,
                total: 1,
                minPrice: 100,
                maxPrice: 500
            };
            jest.spyOn(repository, 'findAllWithTicketPrices').mockResolvedValue(mockResponse);

            const result = await service.findAll();

            expect(result.items).toHaveLength(1);
            const event = result.items[0];

            // Перевіряємо, що системні поля відсутні
            expect(event['createdAt']).toBeUndefined();
            expect(event['updatedAt']).toBeUndefined();

            // Перевіряємо наявність відносин
            expect(event).toHaveProperty('themes', mockRepositoryEventWithRelations.themes);
            expect(event).toHaveProperty('company', mockRepositoryEventWithRelations.company);
            expect(event).toHaveProperty('format', mockRepositoryEventWithRelations.format);

            // Перевіряємо basic поля
            expect(event).toHaveProperty('id', mockRepositoryEventWithRelations.id);
            expect(event).toHaveProperty('title', mockRepositoryEventWithRelations.title);

            // Перевіряємо поля пагінації та цін
            expect(result).toHaveProperty('count', 1);
            expect(result).toHaveProperty('total', 1);
            expect(result).toHaveProperty('minPrice', 100);
            expect(result).toHaveProperty('maxPrice', 500);

            expect(repository.findAllWithTicketPrices).toHaveBeenCalled();
        });

        it('should return empty array when no events exist', async () => {
            const mockResponse = {
                items: [],
                count: 0,
                total: 0,
                minPrice: null,
                maxPrice: null
            };
            jest.spyOn(repository, 'findAllWithTicketPrices').mockResolvedValue(mockResponse);

            const result = await service.findAll();
            expect(result.items).toHaveLength(0);
            expect(result.count).toBe(0);
            expect(result.total).toBe(0);
            expect(result.minPrice).toBeNull();
            expect(result.maxPrice).toBeNull();
        });
    });

    describe('findByCompanyId', () => {
        it('should return company events with relations and basic fields only', async () => {
            const result = await service.findByCompanyId(1);

            expect(result).toHaveLength(1);
            const event = result[0];

            // Перевіряємо, що системні поля відсутні
            expect(event['createdAt']).toBeUndefined();
            expect(event['updatedAt']).toBeUndefined();

            // Перевіряємо наявність відносин
            expect(event).toHaveProperty('themes', mockRepositoryEventWithRelations.themes);
            expect(event).toHaveProperty('company', mockRepositoryEventWithRelations.company);
            expect(event).toHaveProperty('format', mockRepositoryEventWithRelations.format);

            // Перевіряємо basic поля
            expect(event).toHaveProperty('id', mockRepositoryEventWithRelations.id);
            expect(event).toHaveProperty('title', mockRepositoryEventWithRelations.title);

            expect(repository.findByCompanyId).toHaveBeenCalledWith(1);
        });

        it('should return empty array when company has no events', async () => {
            jest.spyOn(repository, 'findByCompanyId').mockResolvedValue([]);
            const result = await service.findByCompanyId(1);
            expect(result).toEqual([]);
        });
    });
});
