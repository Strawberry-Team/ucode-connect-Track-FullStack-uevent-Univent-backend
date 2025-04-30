// prisma/seeds/users.ts
import { SEEDS } from './seed-constants';
import { faker } from '@faker-js/faker';
import { UserRole } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function getRandomAvatar(id: number, gender: boolean): Promise<string> {
    const avatarUrl = `https://avatar.iran.liara.run/public/${gender ? 'boy' : 'girl'}`;

    try {
        const response = await axios.get(avatarUrl, {
            responseType: 'arraybuffer',
            timeout: 5000,
        });

        const buffer = Buffer.from(response.data);

        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'user-avatars');
        await fs.mkdir(publicDir, { recursive: true });

        const fileName = `user-avatar-${id}.png`;
        const filePath = path.join(publicDir, fileName);

        await fs.writeFile(filePath, buffer);

        return fileName;
    } catch (error) {
        console.error('Error fetching or saving avatar for user', id, error);
        return 'default-avatar.png';
    }
}

export const createInitialUsers = async () => {
    return [
        {
            gender: true,
            firstName: 'Admin',
            lastName: 'System',
            email: `admin@${SEEDS.PRODUCT.DOMAIN}`,
            password: SEEDS.USERS.PASSWORD,
            role: UserRole.ADMIN,
            isEmailVerified: true,
            profilePictureName: SEEDS.PRODUCT.THEME_ID === 2 
                ? SEEDS.USERS.PROFILE_PICTURE_MASK.replace('_', 'female').replace('*', '1')
                : SEEDS.USERS.GENERATE_AVATARS ? await getRandomAvatar(1, true) : SEEDS.USERS.AVATAR_MASK.replace('*', '1'),
        },
        {
            gender: false,
            firstName: 'Test',
            lastName: 'User',
            email: `test.user@${SEEDS.PRODUCT.DOMAIN}`,
            password: SEEDS.USERS.PASSWORD,
            role: UserRole.USER,
            isEmailVerified: true,
            profilePictureName: SEEDS.PRODUCT.THEME_ID === 2 
                ? SEEDS.USERS.PROFILE_PICTURE_MASK.replace('_', 'male').replace('*', '3')
                : SEEDS.USERS.GENERATE_AVATARS ? await getRandomAvatar(2, false) : SEEDS.USERS.AVATAR_MASK.replace('*', '2'),
        },
        ...Array.from({ length: SEEDS.USERS.TOTAL - 2 }, (_, index) => {
            const gender: boolean = faker.datatype.boolean({ probability: SEEDS.USERS.GENDER_PROBABILITY });
            const firstName = faker.person.firstName(gender ? 'male' : 'female');
            const lastName = faker.person.lastName(gender ? 'male' : 'female');
            const id = index + 3;
            
            return {
                gender,
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
                profilePictureName: SEEDS.PRODUCT.THEME_ID === 2 
                    ? SEEDS.USERS.PROFILE_PICTURE_MASK
                        .replace('_', gender ? 'male' : 'female')
                        .replace('*', (gender
                            ? faker.number.int({ min: 3, max: 5 })
                            : faker.number.int({ min: 1, max: 2 })
                        ).toString())
                    : SEEDS.USERS.DEFAULT_AVATAR_PICTURE,
            };
        }),
    ];
};
