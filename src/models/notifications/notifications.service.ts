// src/models/notifications/notifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './entities/notification.entity';
import { plainToInstance } from 'class-transformer';
import { EventStatusChangedEvent, EventCreatedEvent, NewsCreatedEvent } from '../../common/events/notification-events.interface';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EntityType } from '../subscriptions/dto/create-subscription.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly notificationsRepository: NotificationsRepository,
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    async findAll(userId: number): Promise<Notification[]> {
        const notifications = await this.notificationsRepository.findAll(userId);
        const unhiddenNotifications = notifications.filter(notification => !notification.hiddenAt);
        
        unhiddenNotifications.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return plainToInstance(Notification, unhiddenNotifications, {
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

    async updateNotification(id: number, userId: number, dto: UpdateNotificationDto): Promise<Notification> {
        const notification = await this.notificationsRepository.findById(id);
        
        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        
        if (notification.userId !== userId) {
            throw new NotFoundException('Notification not found');
        }
        
        const updateData = dto.action === 'read' 
            ? { readAt: new Date() } 
            : { hiddenAt: new Date() };
        
        return this.notificationsRepository.update(id, updateData);
    }

    private getEventStatusNotificationContent(event: EventStatusChangedEvent): { title: string; content: string } {
        return {
            title: "Event status changed",
            content: `${this.getStatusChangeMessage(event.newStatus)} "${event.title}"`,
        };
    }

    private getEventCreatedNotificationContent(event: EventCreatedEvent): { title: string; content: string } {
        return {
            title: "New event created",
            content: `A new event "${event.title}" has been created`,
        };
    }

    private getNewsNotificationContent(news: NewsCreatedEvent): { title: string; content: string } {
        return {
            title: "News published",
            content: `New article published: "${news.title}"`,
        };
    }

    private getStatusChangeMessage(newStatus: EventStatus): string {
        switch (newStatus) {
            case EventStatus.SALES_STARTED:
                return "Розпочався продаж квитків на подію";
            case EventStatus.ONGOING:
                return "Подія розпочалася";
            case EventStatus.FINISHED:
                return "Подія завершилася";
            case EventStatus.CANCELLED:
                return "Подію скасовано";
            case EventStatus.PUBLISHED:
                return "Подію опубліковано";
            case EventStatus.DRAFT:
                return "Подію переведено в чернетку";
            default:
                return "Статус події змінено";
        }
    }
}
