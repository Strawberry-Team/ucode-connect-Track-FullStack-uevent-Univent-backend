import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { EventDatesValidatorConstraint } from './validators/event-dates.validator';
import { ValidationArguments } from 'class-validator';

describe('EventsController', () => {
    let controller: EventsController;
    let service: EventsService;
    let validator: EventDatesValidatorConstraint;

    const mockEvent = {
        id: 1,
        companyId: 1,
        formatId: 1,
        title: 'Test Event',
        description: 'Test Description',
        venue: 'Test Venue',
        locationCoordinates: '50.4501,30.5234',
        startedAt: new Date('2024-04-05T10:00:00Z'),
        endedAt: new Date('2024-04-05T12:00:00Z'),
        publishedAt: new Date('2024-04-04T10:00:00Z'),
        ticketsAvailableFrom: new Date('2024-04-04T11:00:00Z'),
        posterName: 'test-poster.jpg',
        attendeeVisibility: AttendeeVisibility.EVERYONE,
        status: EventStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        findAllEvents: jest.fn().mockResolvedValue([mockEvent]),
                        findById: jest.fn().mockResolvedValue(mockEvent),
                        createEvent: jest.fn().mockResolvedValue(mockEvent),
                        updateEvent: jest.fn().mockResolvedValue(mockEvent),
                        deleteEvent: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        service = module.get<EventsService>(EventsService);
        validator = new EventDatesValidatorConstraint();
    });

    describe('create', () => {
        it('should create event with valid data', async () => {
            const result = await controller.create(mockEvent);
            expect(result).toEqual(mockEvent);
        });

        it('should throw error when event duration is less than minimum', async () => {
            const dto = {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T10:14:59Z'), // менше 15 хвилин
            };

            const args: ValidationArguments = {
                object: dto,
                value: dto,
                targetName: '',
                property: '',
                constraints: [],
            };

            const isValid = validator.validate(dto, args);
            expect(isValid).toBe(false);
            expect(validator.defaultMessage(args))
                .toContain('minimum duration');
        });

        it('should throw error when endedAt is before or equal to startedAt', async () => {
            const dto = {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T10:00:00Z'), // та сама дата
            };

            const args: ValidationArguments = {
                object: dto,
                value: dto,
                targetName: '',
                property: '',
                constraints: [],
            };

            const isValid = validator.validate(dto, args);
            expect(isValid).toBe(false);
            expect(validator.defaultMessage(args))
                .toContain('end date must be after the start date');
        });

        it('should throw error when tickets are available after event starts', async () => {
            const dto = {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T12:00:00Z'),
                ticketsAvailableFrom: new Date('2024-04-05T10:30:00Z'), // після початку події
            };

            const args: ValidationArguments = {
                object: dto,
                value: dto,
                targetName: '',
                property: '',
                constraints: [],
            };

            const isValid = validator.validate(dto, args);
            expect(isValid).toBe(false);
            expect(validator.defaultMessage(args))
                .toContain('ticket sales must end before the event starts');
        });

        it('should throw error when tickets are available before publication', async () => {
            const dto = {
                ...mockEvent,
                publishedAt: new Date('2024-04-04T10:00:00Z'),
                ticketsAvailableFrom: new Date('2024-04-04T09:00:00Z'), // до публікації
            };

            const args: ValidationArguments = {
                object: dto,
                value: dto,
                targetName: '',
                property: '',
                constraints: [],
            };

            const isValid = validator.validate(dto, args);
            expect(isValid).toBe(false);
            expect(validator.defaultMessage(args))
                .toContain('ticket sales cannot start before the event is published');
        });
    });

    describe('update', () => {
        it('should update event with valid data', async () => {
            const updateDto: UpdateEventDto = {
                title: 'Updated Event',
                description: 'Updated Description',
            };

            const result = await controller.update(1, updateDto);
            expect(result).toEqual(mockEvent);
            expect(service.updateEvent).toHaveBeenCalledWith(1, updateDto);
        });

        it('should throw error when updating with invalid dates', async () => {
            const updateDto = {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T10:00:00Z'), // та сама дата
            };

            const args: ValidationArguments = {
                object: updateDto,
                value: updateDto,
                targetName: '',
                property: '',
                constraints: [],
            };

            const isValid = validator.validate(updateDto, args);
            expect(isValid).toBe(false);
            expect(validator.defaultMessage(args))
                .toContain('end date must be after the start date');
        });
    });

    describe('findAll', () => {
        it('should return array of events', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([mockEvent]);
            expect(service.findAllEvents).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return single event', async () => {
            const result = await controller.findOne(1);
            expect(result).toEqual(mockEvent);
            expect(service.findById).toHaveBeenCalledWith(1);
        });
    });

    describe('remove', () => {
        it('should delete event', async () => {
            await controller.remove(1);
            expect(service.deleteEvent).toHaveBeenCalledWith(1);
        });
    });
});
