// src/models/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(notification: Partial<Notification>): Promise<Notification> {
        return this.db.notification.create({ data: notification as any });
    }

    async findAll(userId: number): Promise<Notification[]> {
        return this.db.notification.findMany({ 
            where: { 
                userId,
                hiddenAt: null
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
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
            },
        });
    }

    async findById(id: number): Promise<Notification | null> {
        return this.db.notification.findUnique({ where: { id } });
    }

    async update(id: number, data: Partial<Notification>): Promise<Notification> {
        return this.db.notification.update({
            where: { id },
            data: data as any,
        });
    }
}
