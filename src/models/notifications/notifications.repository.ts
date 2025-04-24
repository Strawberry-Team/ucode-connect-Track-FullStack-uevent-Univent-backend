// src/models/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Notification } from './entities/notification.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(notification: Partial<Notification>): Promise<Notification> {
        return this.db.notification.create({ data: notification as any });
    }

    async findAll(userId: number, query?: GetNotificationsDto): 
    Promise<{ items: Notification[]; count: number; total: number }> {
        const {
            readAt,
            hiddenAt,
            skip = 0,
            take = 10
        } = query || {};

        const where: Prisma.NotificationWhereInput = {
            userId,
            ...(readAt && { readAt: { gte: new Date(readAt) } }),
            ...(hiddenAt && { hiddenAt: { gte: new Date(hiddenAt) } }),
        };

        const [items, total] = await Promise.all([
            this.db.notification.findMany({
                where,
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
                skip,
                take,
            }),
            this.db.notification.count({ where })
        ]);

        return {
            items,
            count: items.length,
            total
        };
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
