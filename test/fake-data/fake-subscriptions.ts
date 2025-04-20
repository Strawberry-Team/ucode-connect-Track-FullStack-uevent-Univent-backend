// test/fake-data/fake-subscriptions.ts
import { faker } from '@faker-js/faker';
import { Subscription } from '../../src/models/subscriptions/entities/subscription.entity';
import {
    CreateSubscriptionDto,
    EntityType,
} from '../../src/models/subscriptions/dto/create-subscription.dto';
import { SubscriptionInfoDto } from '../../src/models/subscriptions/dto/subscription-info.dto';
import { Event } from '../../src/models/events/entities/event.entity';
import { Company } from '../../src/models/companies/entities/company.entity';

export class SubscriptionsTestUtils {
    static generateFakeSubscription(
        overrides: Partial<Subscription> = {},
    ): Subscription {
        const entityType =
            overrides.eventId !== undefined && overrides.eventId !== null
                ? EntityType.EVENT
                : overrides.companyId !== undefined && overrides.companyId !== null
                    ? EntityType.COMPANY
                    : faker.helpers.arrayElement([EntityType.EVENT, EntityType.COMPANY]);

        return {
            id: overrides.id ?? faker.number.int({ min: 1, max: 1000 }),
            userId: overrides.userId ?? faker.number.int({ min: 1, max: 1000 }),
            eventId:
                entityType === EntityType.EVENT
                    ? overrides.eventId ?? faker.number.int({ min: 1, max: 100 })
                    : null,
            companyId:
                entityType === EntityType.COMPANY
                    ? overrides.companyId ?? faker.number.int({ min: 1, max: 50 })
                    : null,
            createdAt: overrides.createdAt ?? faker.date.past(),
            user: overrides.user,
            event: overrides.event !== undefined ? overrides.event : null,
            company: overrides.company !== undefined ? overrides.company : null,
        };
    }


    static generateFakeSubscriptions(
        count: number,
        overrides: Partial<Subscription> = {},
    ): Subscription[] {
        return Array.from({ length: count }, () =>
            this.generateFakeSubscription(overrides),
        );
    }

    static generateFakeCreateSubscriptionDto(
        overrides: Partial<CreateSubscriptionDto> = {},
    ): CreateSubscriptionDto {
        const entityType =
            overrides.entityType ??
            faker.helpers.arrayElement([EntityType.EVENT, EntityType.COMPANY]);
        return {
            entityId:
                overrides.entityId ?? faker.number.int({ min: 1, max: 100 }),
            entityType: entityType,
        };
    }

    static generateFakeSubscriptionInfoDto(
        overrides: Partial<SubscriptionInfoDto> = {},
    ): SubscriptionInfoDto {
        return {
            subscribersCount:
                overrides.subscribersCount ?? faker.number.int({ min: 0, max: 500 }),
            subscriptionId:
                overrides.subscriptionId ??
                (faker.datatype.boolean()
                    ? faker.number.int({ min: 1, max: 1000 })
                    : undefined),
        };
    }

    static generateFakeEvent(overrides: Partial<Event> = {}): Event {
        return {
            id: overrides.id ?? faker.number.int({ min: 1, max: 100 }),
            title: overrides.title ?? faker.lorem.words(3),
        } as Event;
    }

    static generateFakeCompany(overrides: Partial<Company> = {}): Company {
        return {
            id: overrides.id ?? faker.number.int({ min: 1, max: 50 }),
            title: overrides.title ?? faker.company.name(),
        } as Company;
    }
}
