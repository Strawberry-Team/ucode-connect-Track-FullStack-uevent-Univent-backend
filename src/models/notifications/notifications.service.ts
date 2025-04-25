// src/models/notifications/notifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './entities/notification.entity';
import { plainToInstance } from 'class-transformer';
import {
    EventStatusChangedEvent,
    EventCreatedEvent,
    NewsCreatedEvent,
    EventDateChangedEvent, EventVenueChangedEvent,
    AttendeeCreatedEvent,
} from '../../common/events/notification-events.interface';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EntityType } from '../subscriptions/dto/create-subscription.dto';
import { EventStatus } from '@prisma/client';
import { format } from "date-fns";


@Injectable()
export class NotificationsService {
    constructor(
        private readonly notificationsRepository: NotificationsRepository,
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    async findAll(userId: number): Promise<Notification[]> {
        const notifications = await this.notificationsRepository.findAll(userId);

        return plainToInstance(Notification, notifications, {
            excludeExtraneousValues: true,
            groups: ['basic'],
        });
    }

    async findById(id: number): Promise<Notification | null> {
        const notification = await this.notificationsRepository.findById(id);
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async create(notification: Partial<Notification>): Promise<Notification> {
        return this.notificationsRepository.create(notification);
    }

    async createEventStatusNotification(event: EventStatusChangedEvent): Promise<void> {
        const subscriberIds = await this.subscriptionsService.findAllUserIdsByEventId(event.eventId);
        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getEventStatusNotificationContent(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: event.eventId
                })
            )
        );
    }

    async createEventStartDateNotification(event: EventDateChangedEvent): Promise<void> {
        const subscriberIds = await this.subscriptionsService.findAllUserIdsByEventId(event.eventId);
        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getEventStartDateNotificationContent(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: event.eventId
                })
            )
        );
    }

    async createEventTicketsAvailableFromDateNotification(event: EventDateChangedEvent): Promise<void> {
        const subscriberIds = await this.subscriptionsService.findAllUserIdsByEventId(event.eventId);
        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getEventTicketsAvailableFromNotificationContent(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: event.eventId
                })
            )
        );
    }

    async createEventVenueNotification(event: EventVenueChangedEvent): Promise<void> {
        const subscriberIds = await this.subscriptionsService.findAllUserIdsByEventId(event.eventId);
        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getEventVenueNotificationContent(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: event.eventId
                })
            )
        );
    }

    async createEventCreatedNotification(event: EventCreatedEvent): Promise<void> {
        const subscriberIds = await this.subscriptionsService.findAllUserIdsByCompanyId(event.companyId);
        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getEventCreatedNotificationContent(event);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: event.eventId,
                })
            )
        );
    }

    async createNewsNotification(news: NewsCreatedEvent): Promise<void> {
        if (news.eventId && news.companyId) {
            throw new BadRequestException('Cannot specify both eventId and companyId simultaneously');
        }

        if (!news.eventId && !news.companyId) {
            return;
        }

        let subscriberIds: number[] = [];

        if (news.eventId) {
            subscriberIds = await this.subscriptionsService.findAllUserIdsByEntityId(news.eventId, EntityType.EVENT);
        } else if (news.companyId) {
            subscriberIds = await this.subscriptionsService.findAllUserIdsByEntityId(news.companyId, EntityType.COMPANY);
        }

        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getNewsNotificationContent(news);
        
        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: news.eventId || null,
                    companyId: news.companyId || null,
                })
            )
        );
    }

    async createAttendeeNotification(attendee: AttendeeCreatedEvent): Promise<void> {
        if (attendee.eventId) {
            throw new BadRequestException('Unable to not specify an eventId');
        }

        if (!attendee.eventId && !attendee.userId) {
            return;
        }

        let subscriberIds: number[] = [];

        if (attendee.eventId) {
            subscriberIds = await this.subscriptionsService.findAllUserIdsByEntityId(attendee.eventId, EntityType.EVENT);
        }

        if (subscriberIds.length === 0) {
            return;
        }

        const { title, content } = this.getAttendeeNotificationContent(attendee);

        await Promise.all(
            subscriberIds.map(userId =>
                this.create({
                    userId,
                    title,
                    content,
                    eventId: attendee.eventId || null,
                    companyId: null,
                })
            )
        );
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

    private getEventStatusNotificationContent(event: EventStatusChangedEvent): { title: string; content: string } {
        return {
            title: "Event status updated",
            content: `${this.getStatusChangeMessage(event.newStatus, event.title)}`,
        };
    }

    private getEventStartDateNotificationContent(event: EventDateChangedEvent): { title: string; content: string } {
        return {
            title: "Event start date postponed",
            content: `Event "${event.title}" start date postponed from ${format(new Date(event.oldStartDate), "MMMM d, yyyy HH:mm")} to ${format(new Date(event.newStartDate), "MMMM d, yyyy HH:mm")}`,
        };
    }

    private getEventTicketsAvailableFromNotificationContent(event: EventDateChangedEvent): { title: string; content: string } {
        return {
            title: "Ticket sales start date postponed",
            content: `Start of ticket sales for the "${event.title}" event postponed to ${format(new Date(event.newStartDate), "MMM d, yyyy HH:mm")}`,
        };
    }

    private getEventVenueNotificationContent(event: EventVenueChangedEvent): { title: string; content: string } {
        return {
            title: "Event venue updated",
            content: `Event "${event.title}" moved from ${event.oldVenue} to ${event.newVenue}`,
        };
    }

    private getEventCreatedNotificationContent(event: EventCreatedEvent): { title: string; content: string } {
        return {
            title: "New event published",
            content: `New event "${event.title}" published by "${event.companyTitle}" company`,
        };
    }

    private getNewsNotificationContent(news: NewsCreatedEvent): { title: string; content: string } {
        if (news.eventId) {
            return this.getEventNewsNotificationContent(news);
        } else if (news.companyId) {
            return this.getCompanyNewsNotificationContent(news);
        } else {
            throw new BadRequestException('Cannot specify both eventId and companyId simultaneously or nothing');
        }
    }

    private getEventNewsNotificationContent(news: NewsCreatedEvent): { title: string; content: string } {
        return {
            title: "Event news published",
            content: `News on the "${news.eventTitle}" event published: "${news.title}"`,
        };
    }

    private getCompanyNewsNotificationContent(news: NewsCreatedEvent): { title: string; content: string } {
        return {
            title: "Company news published",
            content: `News on the "${news.companyTitle}" company published: "${news.title}"`,
        };
    }

    private getAttendeeNotificationContent(attendee: AttendeeCreatedEvent): { title: string; content: string } {
        return {
            title: "New event attendee joinded",
            content: `User ${attendee.userFullName} joined the event "${attendee.eventTitle}"`,
        };
    }

    private getStatusChangeMessage(newStatus: EventStatus, title: string): string {
        switch (newStatus) {
            case EventStatus.SALES_STARTED:
                return `Ticket sales for the "${title}" event have started`;
            case EventStatus.ONGOING:
                return `The "${title}" event has started`;
            case EventStatus.FINISHED:
                return `The "${title}" event has finished`;
            case EventStatus.CANCELLED:
                return `The "${title}" event has been cancelled`;
            case EventStatus.PUBLISHED:
                return `The "${title}" event has been published`;
            case EventStatus.DRAFT:
                return `The "${title}" event has been moved to draft`;
            default:
                return `The "${title}" event status has changed`;
        }
    }
}
