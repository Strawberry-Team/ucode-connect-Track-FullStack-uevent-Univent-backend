// src/models/notifications/notifications.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionsService } from './subscriptions.service';
import {
    AttendeeCreatedEvent,
} from '../../common/events/notification-events.interface';
import { EntityType } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsListener {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @OnEvent('eventAttendee.created')
    async handleAttendeeCreatedEvent(
        payload: AttendeeCreatedEvent,
    ): Promise<void> {
        try {
            console.log('eventAttendee.created', payload);
            await this.subscriptionsService.create({
                entityId: payload.eventId,
                entityType: EntityType.EVENT,
            }, payload.userId);
        } catch (error) {
            console.error(`Failed to create subscription for event ${payload.eventId}: ${error.message}`);
        }
    }
}
