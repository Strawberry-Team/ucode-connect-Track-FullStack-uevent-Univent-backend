// src/models/notifications/notifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './entities/notification.entity';
import { plainToInstance } from 'class-transformer';
import {
    EventStatusChangedEvent,
    EventCreatedEvent,
    NewsCreatedEvent,
    EventDateChangedEvent, 
    EventVenueChangedEvent,
    AttendeeCreatedEvent,
} from '../../common/events/notification-events.interface';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EntityType } from '../subscriptions/dto/create-subscription.dto';
import { EventStatus } from '@prisma/client';
import { format } from "date-fns";

interface NotificationContent {
    title: string;
    content: string;
}

interface NotificationData {
    eventId?: number | null;
    companyId?: number | null;
    subscriberIds: number[];
    content: NotificationContent;
}

const NOTIFICATION_TITLES = {
    EVENT_STATUS: 'Event status updated',
    EVENT_START_DATE: 'Event start date postponed',
    EVENT_TICKETS_SALE: 'Ticket sales start date postponed',
    EVENT_VENUE: 'Event venue updated',
    EVENT_CREATED: 'New event published',
    EVENT_NEWS: 'Event news published',
    COMPANY_NEWS: 'Company news published',
    NEW_ATTENDEE: 'New event attendee joined',
} as const;

type NotificationFactory<T> = {
    getSubscriberIds: (event: T) => Promise<number[]>;
    getContent: (event: T) => NotificationContent;
    getMetadata: (event: T) => Pick<Notification, 'eventId' | 'companyId'>;
};

@Injectable()
export class NotificationsService {
    private readonly notificationFactories: {
        [K in 'eventStatus' | 'eventStartDate' | 'eventTickets' | 'eventVenue' | 'eventCreated' | 'news' | 'attendee']: NotificationFactory<any>
    };

    constructor(
        private readonly notificationsRepository: NotificationsRepository,
        private readonly subscriptionsService: SubscriptionsService
    ) {
        this.notificationFactories = {
            eventStatus: {
                getSubscriberIds: (event: EventStatusChangedEvent) => 
                    this.subscriptionsService.findAllUserIdsByEventId(event.eventId),
                getContent: (event: EventStatusChangedEvent) => ({
                    title: NOTIFICATION_TITLES.EVENT_STATUS,
                    content: this.getStatusChangeMessage(event.newStatus, event.title),
                }),
                getMetadata: (event: EventStatusChangedEvent) => ({
                    eventId: event.eventId,
                    companyId: null,
                }),
            },
            eventStartDate: {
                getSubscriberIds: (event: EventDateChangedEvent) =>
                    this.subscriptionsService.findAllUserIdsByEventId(event.eventId),
                getContent: (event: EventDateChangedEvent) => ({
                    title: NOTIFICATION_TITLES.EVENT_START_DATE,
                    content: `Event "${event.title}" start date postponed from ${format(new Date(event.oldStartDate), "MMMM d, yyyy HH:mm")} to ${format(new Date(event.newStartDate), "MMMM d, yyyy HH:mm")}`,
                }),
                getMetadata: (event: EventDateChangedEvent) => ({
                    eventId: event.eventId,
                    companyId: null,
                }),
            },
            eventTickets: {
                getSubscriberIds: (event: EventDateChangedEvent) =>
                    this.subscriptionsService.findAllUserIdsByEventId(event.eventId),
                getContent: (event: EventDateChangedEvent) => ({
                    title: NOTIFICATION_TITLES.EVENT_TICKETS_SALE,
                    content: `Start of ticket sales for the "${event.title}" event postponed to ${format(new Date(event.newStartDate), "MMM d, yyyy HH:mm")}`,
                }),
                getMetadata: (event: EventDateChangedEvent) => ({
                    eventId: event.eventId,
                    companyId: null,
                }),
            },
            eventVenue: {
                getSubscriberIds: (event: EventVenueChangedEvent) =>
                    this.subscriptionsService.findAllUserIdsByEventId(event.eventId),
                getContent: (event: EventVenueChangedEvent) => ({
                    title: NOTIFICATION_TITLES.EVENT_VENUE,
                    content: `Event "${event.title}" moved from ${event.oldVenue} to ${event.newVenue}`,
                }),
                getMetadata: (event: EventVenueChangedEvent) => ({
                    eventId: event.eventId,
                    companyId: null,
                }),
            },
            eventCreated: {
                getSubscriberIds: (event: EventCreatedEvent) =>
                    this.subscriptionsService.findAllUserIdsByCompanyId(event.companyId),
                getContent: (event: EventCreatedEvent) => ({
                    title: NOTIFICATION_TITLES.EVENT_CREATED,
                    content: `New event "${event.title}" published by "${event.companyTitle}" company`,
                }),
                getMetadata: (event: EventCreatedEvent) => ({
                    eventId: event.eventId,
                    companyId: null,
                }),
            },
            news: {
                getSubscriberIds: async (news: NewsCreatedEvent) => {
                    if (news.eventId && news.companyId) {
                        throw new BadRequestException('Cannot specify both eventId and companyId simultaneously');
                    }
                    if (!news.eventId && !news.companyId) {
                        return [];
                    }
                    return news.eventId
                        ? await this.subscriptionsService.findAllUserIdsByEntityId(news.eventId, EntityType.EVENT)
                        : await this.subscriptionsService.findAllUserIdsByEntityId(news.companyId!, EntityType.COMPANY);
                },
                getContent: (news: NewsCreatedEvent) => {
                    if (news.eventId) {
                        return {
                            title: NOTIFICATION_TITLES.EVENT_NEWS,
                            content: `News on the "${news.eventTitle}" event published: "${news.title}"`,
                        };
                    }
                    return {
                        title: NOTIFICATION_TITLES.COMPANY_NEWS,
                        content: `News on the "${news.companyTitle}" company published: "${news.title}"`,
                    };
                },
                getMetadata: (news: NewsCreatedEvent) => ({
                    eventId: news.eventId || null,
                    companyId: news.companyId || null,
                }),
            },
            attendee: {
                getSubscriberIds: (attendee: AttendeeCreatedEvent) => {
                    if (!attendee.eventId) {
                        throw new BadRequestException('Unable to not specify an eventId');
                    }
                    return this.subscriptionsService.findAllUserIdsByEntityId(attendee.eventId, EntityType.EVENT);
                },
                getContent: (attendee: AttendeeCreatedEvent) => ({
                    title: NOTIFICATION_TITLES.NEW_ATTENDEE,
                    content: `User ${attendee.userFullName} joined the event "${attendee.eventTitle}"`,
                }),
                getMetadata: (attendee: AttendeeCreatedEvent) => ({
                    eventId: attendee.eventId || null,
                    companyId: null,
                }),
            },
        };
    }

    async findAll(userId: number): Promise<Notification[]> {
        const notifications = await this.notificationsRepository.findAll(userId);
        return plainToInstance(Notification, notifications, {
            excludeExtraneousValues: true,
            groups: ['basic'],
        });
    }

    async findById(id: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findById(id);
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        return notification;
    }

    private async createNotification<T>(
        event: T,
        factory: NotificationFactory<T>
    ): Promise<void> {
        const subscriberIds = await factory.getSubscriberIds(event);
        if (subscriberIds.length === 0) {
            return;
        }

        const content = factory.getContent(event);
        const metadata = factory.getMetadata(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.notificationsRepository.create({
                    userId,
                    ...content,
                    ...metadata,
                })
            )
        );
    }

    async createEventStatusNotification(event: EventStatusChangedEvent): Promise<void> {
        return this.createNotification(event, this.notificationFactories.eventStatus);
    }

    async createEventStartDateNotification(event: EventDateChangedEvent): Promise<void> {
        return this.createNotification(event, this.notificationFactories.eventStartDate);
    }

    async createEventTicketsAvailableFromDateNotification(event: EventDateChangedEvent): Promise<void> {
        return this.createNotification(event, this.notificationFactories.eventTickets);
    }

    async createEventVenueNotification(event: EventVenueChangedEvent): Promise<void> {
        return this.createNotification(event, this.notificationFactories.eventVenue);
    }

    async createEventCreatedNotification(event: EventCreatedEvent): Promise<void> {
        return this.createNotification(event, this.notificationFactories.eventCreated);
    }

    async createNewsNotification(news: NewsCreatedEvent): Promise<void> {
        return this.createNotification(news, this.notificationFactories.news);
    }

    async createAttendeeNotification(attendee: AttendeeCreatedEvent): Promise<void> {
        return this.createNotification(attendee, this.notificationFactories.attendee);
    }

    async updateNotification(id: number, userId: number, dto: UpdateNotificationDto): Promise<Notification> {
        const notification = await this.notificationsRepository.findById(id);
        
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        
        if (notification.userId !== userId) {
            throw new NotFoundException('Only the recipient of notifications can change their status');
        }
        
        const updateData = dto.action === 'read' 
            ? { readAt: new Date() } 
            : { hiddenAt: new Date() };
        
        const updated = await this.notificationsRepository.update(id, updateData);
        
        return plainToInstance(Notification, updated, {
            excludeExtraneousValues: true,
            groups: ['basic'],
        });
    }

    private getStatusChangeMessage(newStatus: EventStatus, title: string): string {
        const messages: Record<EventStatus, string> = {
            [EventStatus.SALES_STARTED]: `Ticket sales for the "${title}" event have started`,
            [EventStatus.ONGOING]: `The "${title}" event has started`,
            [EventStatus.FINISHED]: `The "${title}" event has finished`,
            [EventStatus.CANCELLED]: `The "${title}" event has been cancelled`,
            [EventStatus.PUBLISHED]: `The "${title}" event has been published`,
            [EventStatus.DRAFT]: `The "${title}" event has been moved to draft`,
        };
        return messages[newStatus] || `The "${title}" event status has changed`;
    }
}
