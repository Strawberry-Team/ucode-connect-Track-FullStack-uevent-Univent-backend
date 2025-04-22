// src/common/events/notification-events.interface.ts
import { EventStatus } from '@prisma/client';

export interface NewsCreatedEvent {
  newsId: number;
  title: string;
  authorId: number;
  companyId?: number;
  eventId?: number;
}

export interface EventStatusChangedEvent {
  eventId: number;
  title: string;
  companyId: number;
  newStatus: EventStatus;
  oldStatus: EventStatus;
}

export interface EventCreatedEvent {
  eventId: number;
  title: string;
  companyId: number;
  status: EventStatus;
} 