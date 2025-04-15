// prisma/seeds/users.ts
import { faker } from '@faker-js/faker';
import { UserRole } from '@prisma/client';
import { SEEDS } from './seed-constants';

export const createInitialUsers = async () => {
    return [
        {
            firstName: 'Admin',
            lastName: 'System',
            email: `admin@${SEEDS.PRODUCT.DOMAIN}`,
            password: SEEDS.USERS.PASSWORD,
            role: UserRole.ADMIN,
            isEmailVerified: true,
            profilePictureName: SEEDS.USERS.PROFILE_PICTURE,
        },
        {
            firstName: 'Test',
            lastName: 'User',
            email: `test.user@${SEEDS.PRODUCT.DOMAIN}`,
            password: SEEDS.USERS.PASSWORD,
            role: UserRole.USER,
            isEmailVerified: true,
            profilePictureName: SEEDS.USERS.PROFILE_PICTURE,
        },
        ...Array.from({ length: SEEDS.USERS.TOTAL - 2 }, () => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();

            return {
                firstName,
                lastName,
                email: faker.internet.email({
                    firstName,
                    lastName,
                    provider: SEEDS.PRODUCT.DOMAIN,
                    allowSpecialCharacters: false,
                })
                .toLowerCase(),
                password: SEEDS.USERS.PASSWORD,
                role: UserRole.USER,
                isEmailVerified: true,
                profilePictureName: SEEDS.USERS.PROFILE_PICTURE,
            };
        }),
    ];
};
