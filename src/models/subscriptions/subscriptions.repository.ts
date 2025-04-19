// src/models/subscriptions/subscriptions.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Prisma, Subscription } from '@prisma/client';
import { EntityType } from './dto/create-subscription.dto';
import { EventWithRelations } from '../events/entities/event.entity';
import { CompanyWithBasic } from '../companies/entities/company.entity';
import { EventsRepository } from '../events/events.repository';

@Injectable()
export class SubscriptionsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(
        userId: number,
        entityId: number,
        entityType: EntityType,
    ): Promise<Subscription> {
        const data: Prisma.SubscriptionCreateInput = {
            user: { connect: { id: userId } },
        };

        switch (entityType) {
            case EntityType.EVENT:
                data.event = { connect: { id: entityId } };
                break;
            case EntityType.COMPANY:
                data.company = { connect: { id: entityId } };
                break;
        }

        return this.db.subscription.create({ data });
    }

    async findAllByUserIdForEvents(userId: number): Promise<
        (Subscription & {
            event: EventWithRelations | null;
        })[]
    > {
        const subscriptions = await this.db.subscription.findMany({
            where: { userId, eventId: { not: null } },
            include: {
                event: {
                    include: {
                        themesRelation: {
                            include: { theme: true },
                        },
                        company: {
                            select: {
                                id: true,
                                title: true,
                                logoName: true,
                            },
                        },
                        format: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        return subscriptions.map((sub) => ({
            ...sub,
            event: sub.event ? EventsRepository.transformEventData(sub.event) : null,
        }));
    }

    async findAllByUserIdForCompanies(userId: number): Promise<
        (Subscription & {
            company: CompanyWithBasic | null;
        })[]
    > {
        return this.db.subscription.findMany({
            where: { userId, companyId: { not: null } },
            include: {
                company: {
                    select: {
                        id: true,
                        ownerId: true,
                        email: true,
                        title: true,
                        description: true,
                        logoName: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async findAllUserIdsByEntityId(
        entityId: number,
        entityType: EntityType
    ): Promise<number[]> {
        const whereCondition: Record<string, any> = {};

        switch (entityType) {
            case EntityType.EVENT:
                whereCondition.eventId = entityId;
                break;
            case EntityType.COMPANY:
                whereCondition.companyId = entityId;
                break;
        }

        const subscriptions = await this.db.subscription.findMany({
            where: whereCondition,
            select: { userId: true },
        });

        return subscriptions.map((sub) => sub.userId);
    }

    async findOneById(id: number): Promise<Subscription | null> {
        return this.db.subscription.findUnique({ where: { id } });
    }

    async findOneByUserIdAndEntityId(
        userId: number,
        entityId: number,
        entityType: EntityType
    ): Promise<Subscription | null> {
        let whereCondition;

        switch (entityType) {
            case EntityType.EVENT:
                whereCondition = {
                    eventId_userId: { eventId: entityId, userId }
                };
                break;
            case EntityType.COMPANY:
                whereCondition = {
                    companyId_userId: { companyId: entityId, userId }
                };
                break;
        }

        return this.db.subscription.findUnique({ where: whereCondition });
    }

    async delete(id: number): Promise<Subscription> {
        return this.db.subscription.delete({ where: { id } });
    }

    async countByEntityId(entityId: number, entityType: EntityType): Promise<number> {
        const whereCondition: Record<string, any> = {};

        switch (entityType) {
            case EntityType.EVENT:
                whereCondition.eventId = entityId;
                break;
            case EntityType.COMPANY:
                whereCondition.companyId = entityId;
                break;
        }

        return this.db.subscription.count({ where: whereCondition });
    }
}
