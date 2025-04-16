// src/models/events/event-attendees/event-attendees.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service';
import { plainToInstance } from 'class-transformer';
import { EventAttendee, SERIALIZATION_GROUPS } from './entities/event-attendee.entities';
import { UpdateEventAttendeeDto } from './dto/update-event-attendee.dto';
import { EventAttendeesRepository } from './event-attendees.repository';
import { UsersService } from 'src/models/users/users.service';
import { EventsService } from '../events.service';
import { AttendeeVisibility as EventAttendeeVisibility } from '@prisma/client';

@Injectable()
export class EventAttendeesService {
    constructor(
        private readonly db: DatabaseService,
        private readonly eventAttendeesRepository: EventAttendeesRepository,
        private readonly usersService: UsersService,
        private readonly eventsService: EventsService,
    ) {}

    async createByEventIdAndUserId(eventId: number, userId: number): Promise<EventAttendee> {
        const user = await this.usersService.findUserByIdWithoutPassword(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const event = await this.eventsService.findById(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const existingAttendee = await this.eventAttendeesRepository.findByEventIdAndUserId(eventId, userId);

        if (existingAttendee) {
            throw new ConflictException('User already is an attendee of this event');
        }

        const attendee = await this.eventAttendeesRepository.create({
            eventId,
            userId
        });

        return plainToInstance(EventAttendee, attendee, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async deleteByEventIdAndUserId(eventId: number, userId: number): Promise<void> {
        const attendee = await this.eventAttendeesRepository.findByEventIdAndUserId(eventId, userId);

        if (!attendee) {
            throw new NotFoundException('Attendance record not found');
        }

        await this.eventAttendeesRepository.delete(attendee.id);
    }

    async update(id: number, dto: UpdateEventAttendeeDto): Promise<EventAttendee> {
        let attendee = await this.eventAttendeesRepository.findById(id);
        if (!attendee) {
            throw new NotFoundException('Attendee not found');
        }

        attendee = await this.eventAttendeesRepository.update(id, {
            ...dto,
        });

        return plainToInstance(EventAttendee, attendee, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findByEventIdAndUserId(eventId: number, userId: number): Promise<EventAttendee | null> {
        return this.eventAttendeesRepository.findByEventIdAndUserId(eventId, userId);
    }

    private async getVisibleAttendees(eventId: number): Promise<EventAttendee[]> {
        const attendees = await this.eventAttendeesRepository.findVisibleByEventId(eventId);

        return plainToInstance(EventAttendee, attendees, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async getEventAttendees(eventId: number, currentUserId?: number | null): Promise<EventAttendee[]> {
        const event = await this.eventsService.findById(eventId);
      
        if (!event) {
            throw new NotFoundException('Event not found');
        }
      
        switch (event.attendeeVisibility) {
            case EventAttendeeVisibility.EVERYONE:
                return this.getVisibleAttendees(eventId);
      
            case EventAttendeeVisibility.ATTENDEES_ONLY:
                if (!currentUserId) {
                    return [];
                }
      
                const attendee = await this.findByEventIdAndUserId(eventId, currentUserId);
                if (!attendee) {
                    return [];
                }
      
                return this.getVisibleAttendees(eventId);
      
            case EventAttendeeVisibility.NOBODY:
                return [];
      
            default:
                return [];
        }
    }

    async findById(id: number): Promise<EventAttendee | null> {
        const attendee = await this.eventAttendeesRepository.findById(id);

        if (!attendee) {
            throw new NotFoundException('Attendee not found');
        }

        return plainToInstance(EventAttendee, attendee, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }
}
