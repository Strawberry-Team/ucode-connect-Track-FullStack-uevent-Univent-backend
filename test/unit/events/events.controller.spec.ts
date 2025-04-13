// test/unit/events/events.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../../../src/models/events/events.controller';
import { EventsService } from '../../../src/models/events/events.service';
import { Event, EventWithRelations } from '../../../src/models/events/entities/event.entity';
import { CreateEventDto } from '../../../src/models/events/dto/create-event.dto';
import { UpdateEventDto } from '../../../src/models/events/dto/update-event.dto';
import { NotFoundException } from '@nestjs/common';
import { generateFakeBasicEvent, generateFakeEventWithRelations, generateFakeCreateEventDto, generateFakeUpdateEventDto } from '../../fake-data/fake-events';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';

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

    // TODO: Додати тестові дані для перевірки різних HTTP статусів
    // const invalidCreateEventDto = { ...fakeCreateEventDto, title: '' };
    // const unauthorizedUser = { id: 999 };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(transformedEventWithRelations),
                        create: jest.fn().mockResolvedValue(transformedBasicEvent),
                        findAll: jest.fn().mockResolvedValue([transformedEventWithRelations]),
                        update: jest.fn().mockResolvedValue(transformedBasicEvent),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn().mockReturnValue(true),
                    },
                },
                // TODO: Додати моки для інших провайдерів (guards, interceptors, тощо)
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        eventsService = module.get<EventsService>(EventsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Event', () => {
        // TODO: Додати тести для перевірки HTTP статусів (201, 400, 401, 403)
        // TODO: Додати тести для перевірки заголовків відповіді
        // TODO: Додати тести для перевірки роботи ValidationPipe
        
        it('Should create an event and return basic fields', async () => {
            const result = await controller.create(fakeCreateEventDto, 0);
            expect(result).toEqual(transformedBasicEvent);
            expect(eventsService.create).toHaveBeenCalledWith(fakeCreateEventDto);
        });
    });

    describe('Find All Events', () => {
        // TODO: Додати тести для перевірки параметрів запиту (пагінація, фільтрація, сортування)
        // TODO: Додати тести для перевірки різних форматів відповіді (JSON, XML)
        
        it('Should return all events with relations and basic fields', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([transformedEventWithRelations]);
            expect(eventsService.findAll).toHaveBeenCalled();
        });
    });

    describe('Find One Event', () => {
        it('Should return an event with relations by ID', async () => {
            const result = await controller.findOne(fakeEventWithRelations.id, 0);
            expect(result).toEqual(transformedEventWithRelations);
            expect(eventsService.findById).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findOne(999, 0)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Update Event', () => {
        it('Should update an event and return basic fields', async () => {
            const result = await controller.update(fakeBasicEvent.id, fakeUpdateEventDto, 0);
            expect(result).toEqual(transformedBasicEvent);
            expect(eventsService.update).toHaveBeenCalledWith(fakeBasicEvent.id, fakeUpdateEventDto);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.update(999, fakeUpdateEventDto, 0)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Delete Event', () => {
        it('Should delete an event', async () => {
            await controller.remove(fakeEventWithRelations.id, 0);
            expect(eventsService.delete).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.remove(999, 0)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Event By Id (Public)', () => {
        it('Should return an event with relations by ID', async () => {
            const result = await controller.findOne(fakeEventWithRelations.id, 1);
            expect(result).toEqual(transformedEventWithRelations);
            expect(eventsService.findById).toHaveBeenCalledWith(fakeEventWithRelations.id);
        });

        it('Should throw NotFoundException when event is not found (public endpoint)', async () => {
            jest.spyOn(eventsService, 'findById').mockRejectedValue(new NotFoundException('Event not found'));
            await expect(controller.findOne(999, 1)).rejects.toThrow(NotFoundException);
        });
    });

    // TODO: Додати тести для перевірки обробки помилок від сервісу
    // TODO: Додати тести для перевірки роботи з файлами (якщо є)
    // TODO: Додати тести для перевірки кешування (якщо використовується)
});
