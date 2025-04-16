// test/fake-data/fake-promo-codes.ts
import { faker } from '@faker-js/faker';
import { PromoCode } from '../../src/models/promo-codes/entities/promo-code.entity';

export function generateFakePromoCode(overrides: Partial<PromoCode> = {}): PromoCode {
    return {
        id: overrides.id ?? faker.number.int({ min: 1, max: 1000 }),
        eventId: overrides.eventId ?? faker.number.int({ min: 1, max: 1000 }),
        title: overrides.title ?? faker.lorem.words(3),
        code: overrides.code ?? faker.string.alpha({ length: 10 }),
        discountPercent:
            overrides.discountPercent ??
            Number(faker.number.float({ min: 0.05, max: 0.5, fractionDigits: 2 })),
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date(),
        updatedAt: overrides.updatedAt ?? new Date(),
    };
}
