// src/models/subscriptions/subscriptions.service.ts
import {
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { SubscriptionsRepository } from './subscriptions.repository';
import {
    CreateSubscriptionDto,
    EntityType,
} from './dto/create-subscription.dto';
import {
    SERIALIZATION_GROUPS,
    Subscription,
    SubscriptionWithCompanies,
    SubscriptionWithConfidential,
    SubscriptionWithConfidentialWithoutCompanyId,
    SubscriptionWithConfidentialWithoutEventId,
    SubscriptionWithEvents,
} from './entities/subscription.entity';
import { plainToInstance } from 'class-transformer';
import { EventsService } from '../events/events.service';
import { CompaniesService } from '../companies/companies.service';
import { SubscriptionInfoDto } from './dto/subscription-info.dto';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly subscriptionsRepository: SubscriptionsRepository,
        @Inject(forwardRef(() => EventsService))
        private readonly eventsService: EventsService,
        @Inject(forwardRef(() => CompaniesService))
        private readonly companiesService: CompaniesService,
    ) {}

    async create(
        dto: CreateSubscriptionDto,
        userId: number,
    ): Promise<
        | SubscriptionWithConfidentialWithoutEventId
        | SubscriptionWithConfidentialWithoutCompanyId
    > {
        const { entityId, entityType } = dto;

        switch (entityType) {
            case EntityType.EVENT:
                await this.eventsService.findById(entityId);
                break;
            case EntityType.COMPANY:
                await this.companiesService.findById(entityId);
                break;
        }

        const existingSubscription =
            await this.subscriptionsRepository.findOneByUserIdAndEntityId(
                userId,
                entityId,
                entityType,
            );
        if (existingSubscription) {
            throw new ConflictException(
                `User is already subscribed to this ${entityType}`,
            );
        }

        const subscription = await this.subscriptionsRepository.create(
            userId,
            entityId,
            entityType,
        );

        //TODO: Сделать лучше: возвращать или eventId или companyId в зависимости от entityType
        switch (entityType) {
            case EntityType.EVENT:
                return plainToInstance(
                    SubscriptionWithConfidentialWithoutCompanyId,
                    subscription,
                    {
                        groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                        excludeExtraneousValues: true,
                    },
                );
            case EntityType.COMPANY:
                return plainToInstance(
                    SubscriptionWithConfidentialWithoutEventId,
                    subscription,
                    {
                        groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                        excludeExtraneousValues: true,
                    },
                );
        }
    }

    async findAllByUserIdForEvents(
        userId: number,
    ): Promise<SubscriptionWithEvents[]> {
        const subscriptions =
            await this.subscriptionsRepository.findAllByUserIdForEvents(userId);

        return subscriptions.map((sub) =>
            plainToInstance(Subscription, sub, {
                groups: SERIALIZATION_GROUPS.EVENTS,
            }),
        );
    }

    async findAllByUserIdForCompanies(
        userId: number,
    ): Promise<SubscriptionWithCompanies[]> {
        const subscriptions =
            await this.subscriptionsRepository.findAllByUserIdForCompanies(
                userId,
            );

        return subscriptions.map((sub) =>
            plainToInstance(Subscription, sub, {
                groups: SERIALIZATION_GROUPS.COMPANIES,
            }),
        );
    }

    async getSubscriptionInfo(
        entityType: EntityType,
        entityId: number,
        userId?: number | null,
    ): Promise<SubscriptionInfoDto> {
        switch (entityType) {
            case EntityType.EVENT:
                await this.eventsService.findById(entityId);
                break;
            case EntityType.COMPANY:
                await this.companiesService.findById(entityId);
                break;
        }

        const subscribersCount =
            await this.subscriptionsRepository.countByEntityId(
                entityId,
                entityType,
            );

        let subscriptionId: number | undefined = undefined;

        if (userId) {
            const userSubscription =
                await this.subscriptionsRepository.findOneByUserIdAndEntityId(
                    userId,
                    entityId,
                    entityType,
                );

            if (userSubscription) {
                subscriptionId = userSubscription.id;
            }
        }

        return {
            subscribersCount,
            ...(subscriptionId !== undefined && { subscriptionId }),
        };
    }

    async findAllUserIdsByEventId(eventId: number): Promise<number[]> {
        await this.eventsService.findById(eventId);
        return this.subscriptionsRepository.findAllUserIdsByEntityId(
            eventId,
            EntityType.EVENT,
        );
    }

    async findAllUserIdsByCompanyId(companyId: number): Promise<number[]> {
        await this.companiesService.findById(companyId);
        return this.subscriptionsRepository.findAllUserIdsByEntityId(
            companyId,
            EntityType.COMPANY,
        );
    }

    async findAllUserIdsByEntityId(
        entityId: number,
        entityType: EntityType,
    ): Promise<number[]> {
        switch (entityType) {
            case EntityType.EVENT:
                await this.eventsService.findById(entityId);
                break;
            case EntityType.COMPANY:
                await this.companiesService.findById(entityId);
                break;
        }

        return this.subscriptionsRepository.findAllUserIdsByEntityId(
            entityId,
            entityType,
        );
    }

    async delete(subscriptionId: number): Promise<void> {
        const subscription =
            await this.subscriptionsRepository.findOneById(subscriptionId);
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        await this.subscriptionsRepository.delete(subscriptionId);
    }
}
