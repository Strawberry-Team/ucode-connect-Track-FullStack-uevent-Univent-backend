// prisma/seeds/users.ts
import { faker } from '@faker-js/faker';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_COUNTS } from './seed-constants';

const SALT_ROUNDS = 10;

export const createInitialUsers = async () => {
    const password = await bcrypt.hash('Password123!$', SALT_ROUNDS);

    return [
        {
            firstName: 'Admin',
            lastName: 'System',
            email: `admin@${SEED_COUNTS.PRODUCT.DOMAIN}`,
            password,
            role: UserRole.ADMIN,
            isEmailVerified: true,
            profilePictureName: 'default-avatar.png',
        },
        {
            firstName: 'Test',
            lastName: 'User',
            email: `test.user@${SEED_COUNTS.PRODUCT.DOMAIN}`,
            password,
            role: UserRole.USER,
            isEmailVerified: true,
            profilePictureName: 'default-avatar.png',
        },
        ...Array.from({ length: SEED_COUNTS.USERS.TOTAL - 2 }, () => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();

            return {
                firstName,
                lastName,
                email: faker.internet.email({
                    firstName, 
                    lastName, 
                    provider: SEED_COUNTS.PRODUCT.DOMAIN,
                    allowSpecialCharacters: false,
                }).toLowerCase(),
                password,
                role: UserRole.USER,
                isEmailVerified: true,
                profilePictureName: 'default-avatar.png',
            }
        }),
    ];
}; 