// src/common/events/notification-events.interface.ts
import { EventStatus } from '@prisma/client';
import { Event } from '@prisma/client';

export interface NewsCreatedEvent {
  newsId: number;
  title: string;
  authorId: number;
  companyId?: number;
  companyTitle?: string;
  eventId?: number;
  eventTitle?: string;
}

export interface EventStatusChangedEvent {
  eventId: number;
  title: string;
  companyId: number;
  newStatus: EventStatus;
  oldStatus: EventStatus;
}

export interface EventDateChangedEvent {
    eventId: number;
    title: string;
    companyId: number;
    newStartDate: Date;
    oldStartDate: Date;
}

export interface EventVenueChangedEvent {
    eventId: number;
    title: string;
    companyId: number;
    newVenue: string;
    oldVenue: string;
}

export interface EventCreatedEvent {
  eventId: number;
  title: string;
  companyId: number;
  companyTitle: string;
  status: EventStatus;
}

export interface AttendeeCreatedEvent {
  eventId: number;
  eventTitle: string;
  userId: number;
  userFullName: string;
}