// src/models/notifications/notifications.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventAttendeesService } from './event-attendees.service';
import {
    OrderCreatedEvent,
} from '../../../common/events/order-events.interface';

@Injectable()
export class EventAttendeesListener {
    constructor(private readonly eventAttendeesService: EventAttendeesService) {}

    @OnEvent('order.created')
    async handleOrderCreatedEvent(
        payload: OrderCreatedEvent,
    ): Promise<void> {
        try {
            await this.eventAttendeesService.createByEventIdAndUserId(payload.eventId, payload.userId);
        } catch (error) {
            console.error(`Failed to create event attendee for order ${payload.orderId}: ${error.message}`);
        }
    }
}
