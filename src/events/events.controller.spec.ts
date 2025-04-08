import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { ValidationArguments } from 'class-validator';
import { validate } from 'class-validator';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_CONSTANTS } from './constants/event.constants';

describe('EventsController', () => {
    let controller: EventsController;
    let service: EventsService;

    const mockEvent = {
        id: 1,
        companyId: 1,
        formatId: 1,
        title: 'Test Event',
        description: 'Test Description',
        venue: 'Test Venue',
        locationCoordinates: '50.4501,30.5234',
        startedAt: '2024-04-05T10:00:00Z',  // Тепер рядок
        endedAt: '2024-04-05T12:00:00Z',    // Тепер рядок
        publishedAt: '2024-04-04T10:00:00Z', // Тепер рядок
        ticketsAvailableFrom: '2024-04-04T12:00:00Z', // Тепер рядок
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
    });

    describe('create', () => {
        it('should create event with valid data', async () => {
            const result = await controller.create(mockEvent);
            expect(result).toEqual(mockEvent);
        });

        it('should throw error when event duration is less than minimum', async () => {
            const dto = new CreateEventDto();
            Object.assign(dto, {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T10:30:00Z'), // 30 хвилин, менше ніж MIN_DURATION_MINUTES (60)
            });

            const errors = await validate(dto);
            if (errors.length > 0) {
                console.log('Validation errors:');
                errors.forEach(error => {
                    console.log(`Property: ${error.property}`);
                    console.log('Constraints:', error.constraints);
                });
            }
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => 
                error.property === 'endedAt' && 
                error.constraints && 
                Object.values(error.constraints).some(msg => 
                    msg.includes('minutes different from startedAt')
                )
            )).toBe(true);
        });

        it('should throw error when endedAt is before or equal to startedAt', async () => {
            const dto = new CreateEventDto();
            Object.assign(dto, {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T09:00:00Z'), // раніше startedAt
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => 
                error.property === 'endedAt' && 
                error.constraints && 
                Object.values(error.constraints).some(msg => 
                    msg.includes('must be later than startedAt')
                )
            )).toBe(true);
        });

        it('should throw error when publishedAt is too close to startedAt', async () => {
            const dto = new CreateEventDto();
            Object.assign(dto, {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                publishedAt: new Date('2024-04-05T09:30:00Z'), // 30 хвилин до початку, менше ніж MIN_PUBLISH_BEFORE_START_MINUTES (60)
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => 
                error.property === 'publishedAt' && 
                error.constraints && 
                Object.values(error.constraints).some(msg => 
                    msg.includes('minutes different from startedAt')
                )
            )).toBe(true);
        });

        it('should throw error when ticketsAvailableFrom is too close to startedAt', async () => {
            const dto = new CreateEventDto();
            Object.assign(dto, {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                ticketsAvailableFrom: new Date('2024-04-05T09:30:00Z'), // 30 хвилин до початку, менше ніж MIN_PUBLISH_BEFORE_START_MINUTES (60)
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => 
                error.property === 'ticketsAvailableFrom' && 
                error.constraints && 
                Object.values(error.constraints).some(msg => 
                    msg.includes('minutes different from startedAt')
                )
            )).toBe(true);
        });

        it('should pass validation with valid dates', async () => {
            const dto = new CreateEventDto();
            Object.assign(dto, {
                title: 'Test Event',
                description: 'Test Description',
                venue: 'Test Venue',
                locationCoordinates: '50.4501,30.5234',
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T12:00:00Z'), // 120 хвилин, більше ніж MIN_DURATION_MINUTES (60)
                publishedAt: new Date('2024-04-04T10:00:00Z'), // 24 години до початку, більше ніж MIN_PUBLISH_BEFORE_START_MINUTES (60)
                ticketsAvailableFrom: new Date('2024-04-04T12:00:00Z'), // 22 години до початку, більше ніж MIN_PUBLISH_BEFORE_START_MINUTES (60)
                attendeeVisibility: AttendeeVisibility.EVERYONE,
                status: EventStatus.PUBLISHED,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
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
            const updateDto = new UpdateEventDto();
            Object.assign(updateDto, {
                ...mockEvent,
                startedAt: new Date('2024-04-05T10:00:00Z'),
                endedAt: new Date('2024-04-05T09:00:00Z'), // раніше startedAt
            });

            const errors = await validate(updateDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => 
                error.property === 'endedAt' && 
                error.constraints && 
                Object.values(error.constraints).some(msg => 
                    msg.includes('must be later than startedAt')
                )
            )).toBe(true);
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
