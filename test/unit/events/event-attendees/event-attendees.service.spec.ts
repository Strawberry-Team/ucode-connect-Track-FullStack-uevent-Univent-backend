// test/unit/events/event-attendees/event-attendees.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventAttendeesService } from '../../../../src/models/events/event-attendees/event-attendees.service';
import { EventAttendeesRepository } from '../../../../src/models/events/event-attendees/event-attendees.repository';
import { DatabaseService } from '../../../../src/db/database.service';
import { UsersService } from '../../../../src/models/users/users.service';
import { EventsService } from '../../../../src/models/events/events.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventAttendee } from '../../../../src/models/events/event-attendees/entities/event-attendee.entities';
import { AttendeeVisibility, EventStatus, User } from '@prisma/client';
import { EventWithRelations } from '../../../../src/models/events/entities/event.entity';

// TODO: Створити фабрику для генерації тестових даних:
// - Створити файл fake-event-attendees.ts
// - Використовувати faker для генерації даних
// - Додати різні варіанти тестових даних

describe('EventAttendeesService', () => {
    let service: EventAttendeesService;
    let repository: EventAttendeesRepository;
    let usersService: UsersService;
    let eventsService: EventsService;

    const mockAttendee: Partial<EventAttendee> = {
        id: 1,
        eventId: 1,
        userId: 1,
        isVisible: true
    };

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        profilePictureName: 'avatar.jpg',
        role: 'USER',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockEvent: Partial<EventWithRelations> = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        startedAt: new Date(),
        endedAt: new Date(),
        venue: 'Test Venue',
        locationCoordinates: '50.4501,30.5234',
        attendeeVisibility: AttendeeVisibility.EVERYONE,
        status: EventStatus.PUBLISHED,
        posterName: 'test-poster.jpg',
        publishedAt: new Date(),
        ticketsAvailableFrom: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: 1,
        formatId: 1
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventAttendeesService,
                {
                    provide: EventAttendeesRepository,
                    useValue: {
                        create: jest.fn(),
                        findByEventIdAndUserId: jest.fn(),
                        findVisibleByEventId: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findById: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findUserByIdWithoutPassword: jest.fn(),
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: DatabaseService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<EventAttendeesService>(EventAttendeesService);
        repository = module.get<EventAttendeesRepository>(EventAttendeesRepository);
        usersService = module.get<UsersService>(UsersService);
        eventsService = module.get<EventsService>(EventsService);
    });

    describe('createByEventIdAndUserId', () => {
        it('should create a new attendee', async () => {
            jest.spyOn(usersService, 'findUserByIdWithoutPassword').mockResolvedValue(mockUser);
            jest.spyOn(eventsService, 'findById').mockResolvedValue(mockEvent as EventWithRelations);
            jest.spyOn(repository, 'findByEventIdAndUserId').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockResolvedValue(mockAttendee as EventAttendee);

            const result = await service.createByEventIdAndUserId(1, 1);

            expect(result).toEqual(mockAttendee);
            expect(repository.create).toHaveBeenCalledWith({ eventId: 1, userId: 1 });
        });

        it('should throw NotFoundException when user not found', async () => {
            jest.spyOn(usersService, 'findUserByIdWithoutPassword').mockRejectedValue(new NotFoundException('User not found'));

            await expect(service.createByEventIdAndUserId(1, 1)).rejects.toThrow(NotFoundException);
        });

        // TODO: Додати тести для інших сценаріїв помилок
    });

    describe('deleteByEventIdAndUserId', () => {
        it('should delete an attendee', async () => {
            jest.spyOn(repository, 'findByEventIdAndUserId').mockResolvedValue(mockAttendee as EventAttendee);
            jest.spyOn(repository, 'delete').mockResolvedValue();

            await service.deleteByEventIdAndUserId(1, 1);

            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        // TODO: Додати тести для сценаріїв помилок
    });

    describe('getEventAttendees', () => {
        it('should return visible attendees for EVERYONE visibility', async () => {
            jest.spyOn(eventsService, 'findById').mockResolvedValue(mockEvent as EventWithRelations);
            jest.spyOn(repository, 'findVisibleByEventId').mockResolvedValue([mockAttendee as EventAttendee]);

            const result = await service.getEventAttendees(1);

            expect(result).toEqual([mockAttendee]);
            expect(repository.findVisibleByEventId).toHaveBeenCalledWith(1);
        });

        // TODO: Додати тести для інших типів видимості
    });

    // TODO: Додати тести для інших методів сервісу
});
