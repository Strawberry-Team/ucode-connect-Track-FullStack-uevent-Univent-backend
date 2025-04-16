// src/models/events/event-attendees/event-attendees.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service';
import { EventAttendee } from './entities/event-attendee.entities';

@Injectable()
export class EventAttendeesRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(data: { eventId: number; userId: number }): Promise<EventAttendee> {
        return this.db.eventAttendee.create({
            data
        });
    }

    async findByEventIdAndUserId(eventId: number, userId: number): Promise<EventAttendee | null> {
        return this.db.eventAttendee.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            }
        });
    }

    async findVisibleByEventId(eventId: number): Promise<EventAttendee[]> {
        return this.db.eventAttendee.findMany({
            where: {
                eventId,
                isVisible: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePictureName: true
                    },
                },
            },
        });
    }

    async update(id: number, data: { isVisible: boolean }): Promise<EventAttendee> {
        return this.db.eventAttendee.update({
            where: { id },
            data
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.eventAttendee.delete({
            where: { id },
        });
    }

    async findById(id: number): Promise<EventAttendee | null> {
        return this.db.eventAttendee.findUnique({
            where: { id },
        });
    }
}