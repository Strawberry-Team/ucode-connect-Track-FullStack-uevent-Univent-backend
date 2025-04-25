// prisma/seeds/subscriptions.ts
import { faker } from '@faker-js/faker';
import { SEEDS } from './seed-constants';
import { EntityType } from '../../src/models/subscriptions/dto/create-subscription.dto';

interface SubscriptionSeed {
    userId: number;
    entityId: number;
    entityType: EntityType;
}

export const initialSubscriptions = (() => {
    const allSubscriptions: SubscriptionSeed[] = [];

    const testUserEventIds = [1, 2];
    testUserEventIds.forEach(eventId => {
        allSubscriptions.push({
            userId: 2,
            entityId: eventId,
            entityType: EntityType.EVENT,
        });
    });

    allSubscriptions.push({
        userId: 2,
        entityId: 1,
        entityType: EntityType.COMPANY,
    });

    for (let userId = 3; userId <= SEEDS.USERS.TOTAL; userId++) {
        const eventsCount = faker.number.int({
            min: SEEDS.SUBSCRIPTIONS.MIN_EVENTS_PER_USER,
            max: SEEDS.SUBSCRIPTIONS.MAX_EVENTS_PER_USER,
        });

        const allEventIds = Array.from(
            { length: SEEDS.EVENTS.TOTAL },
            (_, i) => i + 1
        );
        faker.helpers.shuffle(allEventIds);
        const selectedEventIds = allEventIds.slice(0, eventsCount);
        selectedEventIds.forEach((eventId) => {
            allSubscriptions.push({
                userId,
                entityId: eventId,
                entityType: EntityType.EVENT,
            });
        });


        const companiesCount = faker.number.int({
            min: SEEDS.SUBSCRIPTIONS.MIN_COMPANIES_PER_USER,
            max: SEEDS.SUBSCRIPTIONS.MAX_COMPANIES_PER_USER,
        });

        const allCompanyIds = Array.from(
            { length: SEEDS.COMPANIES.TOTAL },
            (_, i) => i + 1
        );
        faker.helpers.shuffle(allCompanyIds);
        const selectedCompanyIds = allCompanyIds.slice(0, companiesCount);
        selectedCompanyIds.forEach((companyId) => {
            allSubscriptions.push({
                userId,
                entityId: companyId,
                entityType: EntityType.COMPANY,
            });
        });
    }

    return allSubscriptions;
})();
