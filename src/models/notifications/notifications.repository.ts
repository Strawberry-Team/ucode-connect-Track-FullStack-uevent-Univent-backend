// src/models/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Notification } from './entities/notification.entity';
import { Prisma } from '@prisma/client';

type NotificationWithRelations = Notification & {
    event?: {
        id: number;
        title: string;
    } | null;
    company?: {
        id: number;
        title: string;
    } | null;
};

const NOTIFICATION_INCLUDE = {
    event: {
        select: {
            id: true,
            title: true,
        },
    },
    company: {
        select: {
            id: true,
            title: true,
        },
    },
} as const;

const DEFAULT_NOTIFICATION_ORDERING = {
    createdAt: 'desc' as const,
} satisfies Prisma.NotificationOrderByWithRelationInput;

@Injectable()
export class NotificationsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(notification: Partial<Notification>): Promise<NotificationWithRelations> {
        return this.db.notification.create({
            data: notification as Prisma.NotificationCreateInput,
            include: NOTIFICATION_INCLUDE,
        });
    }

    async findAll(userId: number): Promise<NotificationWithRelations[]> {
        return this.db.notification.findMany({
            where: {
                userId,
                hiddenAt: null,
            },
            orderBy: DEFAULT_NOTIFICATION_ORDERING,
            include: NOTIFICATION_INCLUDE,
        });
    }

    async findById(id: number): Promise<NotificationWithRelations | null> {
        return this.db.notification.findUnique({
            where: { id },
            include: NOTIFICATION_INCLUDE,
        });
    }

    async update(
        id: number, 
        data: Partial<Notification>
    ): Promise<NotificationWithRelations> {
        return this.db.notification.update({
            where: { id },
            data: data as Prisma.NotificationUpdateInput,
            include: NOTIFICATION_INCLUDE,
        });
    }

    async markAsHidden(id: number): Promise<NotificationWithRelations> {
        return this.update(id, {
            hiddenAt: new Date(),
        });
    }

    async markAsRead(id: number): Promise<NotificationWithRelations> {
        return this.update(id, {
            readAt: new Date(),
        });
    }
}
