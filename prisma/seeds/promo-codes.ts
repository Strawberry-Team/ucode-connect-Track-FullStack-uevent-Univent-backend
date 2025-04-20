// prisma/seeds/promo-codes.ts
import { SEEDS } from './seed-constants';
import { faker } from '@faker-js/faker';

export const initialPromoCodes = Array.from(
    { length: SEEDS.EVENTS.TOTAL },
    (_, eventIndex) => {
        const eventId = eventIndex + 1;

        return SEEDS.PROMO_CODES.CODES.map((promoCode) => ({
            eventId,
            title: `${SEEDS.PROMO_CODES.TITLE_PREFIX} ${eventId} - ${faker.company.catchPhrase()}`,
            code: `${promoCode}_EVENT${eventId}`,
            discountPercent: faker.number.float({
                min: SEEDS.PROMO_CODES.DISCOUNT.MIN,
                max: SEEDS.PROMO_CODES.DISCOUNT.MAX,
                fractionDigits: 2,
            }),
            isActive: faker.datatype.boolean(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
    }
).flat();
