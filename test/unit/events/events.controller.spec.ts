// test/unit/events/events.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../../../src/models/events/events.controller';
import { EventsService } from '../../../src/models/events/events.service';
import { Event } from '../../../src/models/events/entities/event.entity';
import { CreateEventDto } from '../../../src/models/events/dto/create-event.dto';
import { UpdateEventDto } from '../../../src/models/events/dto/update-event.dto';
import { NotFoundException } from '@nestjs/common';
import { generateFakeEvent, generateFakeCreateEventDto, generateFakeUpdateEventDto } from '../../fake-data/fake-events';
import { Reflector } from '@nestjs/core';

jest.mock('../../../src/models/auth/guards/auth.guards', () => ({
    JwtAuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: jest.fn().mockReturnValue(true),
    })),
}));

describe('EventsController', () => {
    let controller: EventsController;
    let eventsService: EventsService;

    const fakeEvent: Event = generateFakeEvent();
    const fakeCreateEventDto: CreateEventDto = generateFakeCreateEventDto();
    const fakeUpdateEventDto: UpdateEventDto = generateFakeUpdateEventDto();
    const fakeUpdatedEvent: Event = {
        ...fakeEvent,
        ...fakeUpdateEventDto,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        findEventById: jest.fn(),
                        createEvent: jest.fn(),
                        findAllEvents: jest.fn(),
                        updateEvent: jest.fn(),
                        deleteEvent: jest.fn(),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        eventsService = module.get<EventsService>(EventsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Event', () => {
        it('Should create an event', async () => {
            jest.spyOn(eventsService, 'createEvent').mockResolvedValue(fakeEvent);

            const result = await controller.create(fakeCreateEventDto, 0);

            expect(result).toEqual(fakeEvent);
            expect(eventsService.createEvent).toHaveBeenCalledWith(fakeCreateEventDto);
        });
    });

    describe('Find All Events', () => {
        it('Should return all events', async () => {
            jest.spyOn(eventsService, 'findAllEvents').mockResolvedValue([fakeEvent]);

            const result = await controller.findAll();

            expect(result).toEqual([fakeEvent]);
            expect(eventsService.findAllEvents).toHaveBeenCalled();
        });
    });

    describe('Find One Event', () => {
        it('Should return an event by ID', async () => {
            jest.spyOn(eventsService, 'findEventById').mockResolvedValue(fakeEvent);

            const result = await controller.findOne(fakeEvent.id, 0);

            expect(result).toEqual(fakeEvent);
            expect(eventsService.findEventById).toHaveBeenCalledWith(fakeEvent.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findEventById').mockRejectedValue(new NotFoundException('Event not found'));

            await expect(controller.findOne(999, 0)).rejects.toThrow(NotFoundException);
            expect(eventsService.findEventById).toHaveBeenCalledWith(999);
        });
    });

    describe('Update Event', () => {
        it('Should update an event', async () => {
            jest.spyOn(eventsService, 'findEventById').mockResolvedValue(fakeEvent);
            jest.spyOn(eventsService, 'updateEvent').mockResolvedValue(fakeUpdatedEvent);

            const result = await controller.update(fakeEvent.id, fakeUpdateEventDto, 0);

            expect(result).toEqual(fakeUpdatedEvent);
            expect(eventsService.findEventById).toHaveBeenCalledWith(fakeEvent.id);
            expect(eventsService.updateEvent).toHaveBeenCalledWith(fakeEvent.id, fakeUpdateEventDto);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findEventById').mockRejectedValue(new NotFoundException('Event not found'));

            await expect(controller.update(999, fakeUpdateEventDto, 0)).rejects.toThrow(NotFoundException);
            expect(eventsService.findEventById).toHaveBeenCalledWith(999);
            expect(eventsService.updateEvent).not.toHaveBeenCalled();
        });
    });

    describe('Delete Event', () => {
        it('Should delete an event', async () => {
            jest.spyOn(eventsService, 'findEventById').mockResolvedValue(fakeEvent);
            jest.spyOn(eventsService, 'deleteEvent').mockResolvedValue(undefined);

            await controller.remove(fakeEvent.id, 0);

            expect(eventsService.findEventById).toHaveBeenCalledWith(fakeEvent.id);
            expect(eventsService.deleteEvent).toHaveBeenCalledWith(fakeEvent.id);
        });

        it('Should throw NotFoundException when event is not found', async () => {
            jest.spyOn(eventsService, 'findEventById').mockRejectedValue(new NotFoundException('Event not found'));

            await expect(controller.remove(999, 0)).rejects.toThrow(NotFoundException);
            expect(eventsService.findEventById).toHaveBeenCalledWith(999);
            expect(eventsService.deleteEvent).not.toHaveBeenCalled();
        });
    });

    describe('Get Event By Id', () => {
        it('Should return an event by ID (public endpoint)', async () => {
            jest.spyOn(eventsService, 'findEventById').mockResolvedValue(fakeEvent);

            const result = await controller.findOne(fakeEvent.id, 1);

            expect(result).toEqual(fakeEvent);
            expect(eventsService.findEventById).toHaveBeenCalledWith(fakeEvent.id);
        });

        it('Should throw NotFoundException when event is not found (public endpoint)', async () => {
            jest.spyOn(eventsService, 'findEventById').mockRejectedValue(new NotFoundException('Event not found'));

            await expect(controller.findOne(999, 1)).rejects.toThrow(NotFoundException);
            expect(eventsService.findEventById).toHaveBeenCalledWith(999);
        });
    });
});
