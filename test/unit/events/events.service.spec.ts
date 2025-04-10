// test/unit/events/events.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../../../src/models/events/events.service';
import { EventsRepository } from '../../../src/models/events/events.repository';
import { Event } from '../../../src/models/events/entities/event.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateEventDto } from '../../../src/models/events/dto/create-event.dto';
import { AttendeeVisibility, EventStatus } from '@prisma/client';

describe('EventsService', () => {
    let service: EventsService;
    let repository: EventsRepository;

    const mockEvent: Event = {
        id: 1,
        companyId: 1,
        formatId: 1,
        title: 'Test Event',
        description: 'Test Description',
        venue: 'Test Venue',
        locationCoordinates: '50.4501,30.5234',
        startedAt: new Date('2024-04-05T10:00:00Z'),
        endedAt: new Date('2024-04-05T11:00:00Z'),
        publishedAt: new Date('2024-04-04T10:00:00Z'),
        ticketsAvailableFrom: new Date('2024-04-04T11:00:00Z'),
        posterName: 'test-poster.jpg',
        attendeeVisibility: AttendeeVisibility.EVERYONE,
        status: EventStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockCreateEventDto: CreateEventDto = {
        companyId: 1,
        formatId: 1,
        title: 'Test Event',
        description: 'Test Description',
        venue: 'Test Venue',
        locationCoordinates: '50.4501,30.5234',
        startedAt: new Date('2024-04-05T10:00:00Z'),
        endedAt: new Date('2024-04-05T11:00:00Z'),
        publishedAt: new Date('2024-04-04T10:00:00Z'),
        ticketsAvailableFrom: new Date('2024-04-04T11:00:00Z'),
        posterName: 'test-poster.jpg',
        attendeeVisibility: AttendeeVisibility.EVERYONE,
        status: EventStatus.PUBLISHED,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                {
                    provide: EventsRepository,
                    useValue: {
                        create: jest.fn(),
                        findById: jest.fn(),
                        findByCompanyId: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
        repository = module.get<EventsRepository>(EventsRepository);
    });

    describe('createEvent', () => {
        it('should set status to PUBLISHED when publishedAt is provided', async () => {
            jest.spyOn(repository, 'create').mockResolvedValue(mockEvent);

            const result = await service.createEvent(mockCreateEventDto);

            expect(result.status).toBe(EventStatus.PUBLISHED);
            expect(repository.create).toHaveBeenCalledWith({
                ...mockCreateEventDto,
                status: EventStatus.PUBLISHED,
            });
        });
    });

    describe('findById', () => {
        it('should return event when found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent);

            const result = await service.findEventById(1);

            expect(result).toEqual(mockEvent);
            expect(repository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when event not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.findEventById(1)).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(1);
        });
    });

    describe('findByCompanyId', () => {
        it('should return all events for company', async () => {
            const companyEvents = [mockEvent];
            jest.spyOn(repository, 'findByCompanyId').mockResolvedValue(companyEvents);

            const result = await service.findEventByCompanyId(1);

            expect(result).toEqual(companyEvents);
            expect(repository.findByCompanyId).toHaveBeenCalledWith(1);
        });

        it('should return empty array when company has no events', async () => {
            jest.spyOn(repository, 'findByCompanyId').mockResolvedValue([]);

            const result = await service.findEventByCompanyId(1);

            expect(result).toEqual([]);
            expect(repository.findByCompanyId).toHaveBeenCalledWith(1);
        });
    });

    describe('updateEvent', () => {
        it('should update event successfully', async () => {
          jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent);

            const updatedEvent = { ...mockEvent, title: 'Updated Title' };
            jest.spyOn(repository, 'update').mockResolvedValue(updatedEvent);

            const result = await service.updateEvent(1, updatedEvent);

            expect(result).toEqual(updatedEvent);
            expect(repository.update).toHaveBeenCalledWith(1, updatedEvent);
        });

        it('should throw NotFoundException when updating non-existent event', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.updateEvent(1, mockEvent)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteEvent', () => {
        it('should delete event successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(mockEvent);

            jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

            await service.deleteEvent(1);

            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when deleting non-existent event', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.deleteEvent(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllEvents', () => {
        it('should return all events', async () => {
            const allEvents = [mockEvent];
            jest.spyOn(repository, 'findAll').mockResolvedValue(allEvents);

            const result = await service.findAllEvents();

            expect(result).toEqual(allEvents);
            expect(repository.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no events exist', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([]);

            const result = await service.findAllEvents();

            expect(result).toEqual([]);
            expect(repository.findAll).toHaveBeenCalled();
        });
    });
});
