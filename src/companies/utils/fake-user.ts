import { User } from '../../users/entity/user.entity';
import { faker } from '@faker-js/faker';

function generateFakeFirstName(): string {
    return faker.person.firstName();
}

function generateFakeLastName(): string {
    return faker.person.lastName();
}

function generateFakeEmail(firstName: string, lastName: string): string {
    return faker.internet.email({
        firstName,
        lastName,
        provider: 'example.com',
        allowSpecialCharacters: false,
    });
}

function generateFakePassword(): string {
    return 'Password123!$';
}

export function generateFakeUser<K extends keyof User>(
    allFields = true,
    fields: K[] = [],
): Pick<User, K> {
    const firstName = generateFakeFirstName();
    const lastName = generateFakeLastName();

    const fakeUser: User = {
        id: faker.number.int({ min: 1, max: 1000 }),
        firstName,
        lastName,
        email: generateFakeEmail(firstName, lastName),
        password: generateFakePassword(),
        profilePictureName: `profile-${faker.string.uuid()}.jpg`,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokenNonces: [],
    };

    if (allFields) {
        return fakeUser;
    }

    const user = {} as Pick<User, K>;

    fields.forEach((field) => {
        user[field] = fakeUser[field];
    });

    return user;
}

export function pickUserFields<T extends User, K extends keyof T>(
    obj: T,
    fields: K[],
): Pick<T, K> {
    const result = {} as Pick<T, K>;

    fields.forEach((field) => {
        if (field in obj) {
            result[field] = obj[field];
        }
    });

    return result;
}
