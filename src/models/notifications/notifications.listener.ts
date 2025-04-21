import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NewsCreatedEvent, EventStatusChangedEvent, EventCreatedEvent } from '../../common/events/notification-events.interface';

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('news.created')
  async handleNewsCreatedEvent(payload: NewsCreatedEvent): Promise<void> {
    await this.notificationsService.createNewsNotification(payload);
  }

  @OnEvent('event.status.changed')
  async handleEventStatusChangedEvent(payload: EventStatusChangedEvent): Promise<void> {
    await this.notificationsService.createEventStatusNotification(payload);
  }

  @OnEvent('event.created')
  async handleEventCreatedEvent(payload: EventCreatedEvent): Promise<void> {
    if (payload.status !== 'DRAFT') {
      await this.notificationsService.createEventCreatedNotification(payload);
    }
  }
} 