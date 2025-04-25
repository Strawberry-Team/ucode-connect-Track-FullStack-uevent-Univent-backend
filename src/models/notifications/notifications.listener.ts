// src/models/notifications/notifications.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import {
    NewsCreatedEvent,
    EventStatusChangedEvent,
    EventCreatedEvent, EventDateChangedEvent, EventVenueChangedEvent,
    AttendeeCreatedEvent,
} from '../../common/events/notification-events.interface';

@Injectable()
export class NotificationsListener {
    constructor(private readonly notificationsService: NotificationsService) {}

    @OnEvent('event.created')
    async handleEventCreatedEvent(payload: EventCreatedEvent): Promise<void> {
        if (payload.status !== 'DRAFT') {
            await this.notificationsService.createEventCreatedNotification(
                payload,
            );
        }
    }

    @OnEvent('event.status.changed')
    async handleEventStatusChangedEvent(
        payload: EventStatusChangedEvent,
    ): Promise<void> {
        await this.notificationsService.createEventStatusNotification(payload);
    }

    @OnEvent('event.startAt.changed')
    async handleEventStartDateChangedEvent(
        payload: EventDateChangedEvent,
    ): Promise<void> {
        await this.notificationsService.createEventStartDateNotification(payload);
    }

    @OnEvent('event.ticketsAvailableFrom.changed')
    async handleEventTicketsAvailableFromDateChangedEvent(
        payload: EventDateChangedEvent,
    ): Promise<void> {
        await this.notificationsService.createEventTicketsAvailableFromDateNotification(payload);
    }

    @OnEvent('event.venue.changed')
    async handleEventVenueChangedEvent(
        payload: EventVenueChangedEvent,
    ): Promise<void> {
        await this.notificationsService.createEventVenueNotification(payload);
    }

    @OnEvent('news.created')
    async handleNewsCreatedEvent(payload: NewsCreatedEvent): Promise<void> {
        await this.notificationsService.createNewsNotification(payload);
    }

    @OnEvent('eventAttendee.created')
    async handleAttendeeCreatedEvent(
        payload: AttendeeCreatedEvent,
    ): Promise<void> {
        await this.notificationsService.createAttendeeNotification(payload);
    }
}
