import { faker } from '@faker-js/faker';
import { RefreshTokenNonce } from '../../../src/refresh-token-nonces/entity/refresh-token-nonce.entity';


export function generateFakeRefreshTokenNonce(
    overrides: Partial<RefreshTokenNonce> = {},
): RefreshTokenNonce {
    return {
        id: overrides.id ?? faker.number.int({ min: 1, max: 1000 }),
        userId: overrides.userId ?? faker.number.int({ min: 1, max: 1000 }),
        nonce: overrides.nonce ?? faker.string.uuid(),
        createdAt: overrides.createdAt ?? new Date(),
        user: overrides.user, // Optional relation property
    };
}
