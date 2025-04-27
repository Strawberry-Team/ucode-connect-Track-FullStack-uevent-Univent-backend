// src/models/subscriptions/subscriptions.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Prisma, Subscription } from '@prisma/client';
import { EntityType } from './dto/create-subscription.dto';
import { EventWithRelations } from '../events/entities/event.entity';
import { CompanyWithBasic } from '../companies/entities/company.entity';
import { EventsRepository } from '../events/events.repository';

type SubscriptionWithEvent = Subscription & {
    event: EventWithRelations | null;
};

type SubscriptionWithCompany = Subscription & {
    company: CompanyWithBasic | null;
};

const EVENT_INCLUDE = {
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
} as const;

const COMPANY_INCLUDE = {
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
} as const;

@Injectable()
export class SubscriptionsRepository {
    constructor(private readonly db: DatabaseService) {}

    private buildCreateInput(
        userId: number,
        entityId: number,
        entityType: EntityType
    ): Prisma.SubscriptionCreateInput {
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

        return data;
    }

    private buildWhereCondition(
        entityId: number,
        entityType: EntityType,
        userId?: number
    ): Prisma.SubscriptionWhereInput {
        if (userId) {
            switch (entityType) {
                case EntityType.EVENT:
                    return { eventId: entityId, userId };
                case EntityType.COMPANY:
                    return { companyId: entityId, userId };
                default:
                    return {};
            }
        }

        switch (entityType) {
            case EntityType.EVENT:
                return { eventId: entityId };
            case EntityType.COMPANY:
                return { companyId: entityId };
            default:
                return {};
        }
    }

    private buildUniqueWhereCondition(
        entityId: number,
        entityType: EntityType,
        userId: number
    ): Prisma.SubscriptionWhereUniqueInput {
        switch (entityType) {
            case EntityType.EVENT:
                return { eventId_userId: { eventId: entityId, userId } };
            case EntityType.COMPANY:
                return { companyId_userId: { companyId: entityId, userId } };
            default:
                throw new Error('Invalid entity type');
        }
    }

    async create(
        userId: number,
        entityId: number,
        entityType: EntityType,
    ): Promise<Subscription> {
        const data = this.buildCreateInput(userId, entityId, entityType);
        return this.db.subscription.create({ data });
    }

    async findAllByUserIdForEvents(userId: number): Promise<SubscriptionWithEvent[]> {
        const subscriptions = await this.db.subscription.findMany({
            where: { userId, eventId: { not: null } },
            include: EVENT_INCLUDE,
        });

        return subscriptions.map((sub) => ({
            ...sub,
            event: sub.event ? EventsRepository.transformEventData(sub.event) : null,
        }));
    }

    async findAllByUserIdForCompanies(userId: number): Promise<SubscriptionWithCompany[]> {
        return this.db.subscription.findMany({
            where: { userId, companyId: { not: null } },
            include: COMPANY_INCLUDE,
        });
    }

    async findAllUserIdsByEntityId(
        entityId: number,
        entityType: EntityType
    ): Promise<number[]> {
        const subscriptions = await this.db.subscription.findMany({
            where: this.buildWhereCondition(entityId, entityType),
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
        return this.db.subscription.findUnique({
            where: this.buildUniqueWhereCondition(entityId, entityType, userId),
        });
    }

    async delete(id: number): Promise<Subscription> {
        return this.db.subscription.delete({ where: { id } });
    }

    async countByEntityId(entityId: number, entityType: EntityType): Promise<number> {
        return this.db.subscription.count({
            where: this.buildWhereCondition(entityId, entityType),
        });
    }
}
