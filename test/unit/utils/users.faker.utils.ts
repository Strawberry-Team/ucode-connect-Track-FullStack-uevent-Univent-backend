// src/users/test/users-test.utils.ts
import { User } from '../../../src/users/entity/user.entity';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../src/users/dto/update-user.dto';
import { UpdateUserPasswordDto } from '../../../src/users/dto/update-user-password.dto';

export class UsersTestUtils {
    /**
     * Генерация случайного имени пользователя.
     */
    static generateFakeFirstName(): string {
        return faker.person.firstName();
    }

    /**
     * Генерация случайной фамилии пользователя.
     */
    static generateFakeLastName(): string {
        return faker.person.lastName();
    }

    /**
     * Генерация случайного email с заданными firstName и lastName.
     */
    static generateFakeEmail(firstName: string, lastName: string): string {
        return faker.internet.email({
            firstName,
            lastName,
            provider: 'example.com',
            allowSpecialCharacters: false,
        });
    }

    /**
     * Генерация стандартного фиктивного пароля.
     */
    static generateFakePassword(): string {
        return 'Password123!$';
    }

    /**
     * Генерация имени файла для аватарки пользователя.
     */
    static generateFakeProfilePictureName(): string {
        return `profile-${faker.string.uuid()}.jpg`;
    }

    /**
     * Генерация полного объекта пользователя.
     */
    static generateFakeUser(): User {
        const firstName = this.generateFakeFirstName();
        const lastName = this.generateFakeLastName();
        return {
            id: faker.number.int({ min: 1, max: 1000 }),
            firstName,
            lastName,
            email: this.generateFakeEmail(firstName, lastName),
            password: this.generateFakePassword(),
            profilePictureName: this.generateFakeProfilePictureName(),
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            refreshTokenNonces: [],
        };
    }

    /**
     * Генерация пользователя с указанными полями посредством выборки.
     */
    static generateFakeUserWithFields<K extends keyof User>(
        fields: K[],
    ): Pick<User, K> {
        const fakeUser = this.generateFakeUser();
        return this.pickUserFields(fakeUser, fields);
    }

    /**
     * Функция для выбора заданных полей из объекта пользователя.
     */
    static pickUserFields<T extends User, K extends keyof T>(
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

    /**
     * Генерация массива фейковых пользователей.
     */
    static generateFakeUsers(count: number): User[] {
        return Array.from({ length: count }).map(() => this.generateFakeUser());
    }

    /**
     * Генерация DTO для создания пользователя.
     */
    static generateCreateUserDto(): CreateUserDto {
        const firstName = this.generateFakeFirstName();
        const lastName = this.generateFakeLastName();
        return {
            firstName,
            lastName,
            email: this.generateFakeEmail(firstName, lastName),
            password: this.generateFakePassword(),
        };
    }

    /**
     * Генерация DTO для обновления данных пользователя.
     */
    static generateUpdateUserDto(): UpdateUserDto {
        return {
            firstName: this.generateFakeFirstName(),
            lastName: this.generateFakeLastName(),
        };
    }

    /**
     * Генерация DTO для обновления пароля пользователя.
     */
    static generateUpdateUserPasswordDto(): UpdateUserPasswordDto {
        return {
            oldPassword: this.generateFakePassword(),
            newPassword: 'NewPassword123!$',
        };
    }

    /**
     * Генерация массива пользователей, у которых неактивирован email.
     * Дата создания устанавливается раньше порогового времени (в секундах).
     */
    static generateUnactivatedUsers(count: number, seconds: number): User[] {
        const thresholdDate = new Date();
        thresholdDate.setSeconds(thresholdDate.getSeconds() - seconds);
        return Array.from({ length: count }, () => {
            const user = this.generateFakeUser();
            user.isEmailVerified = false;
            // Устанавливаем createdAt раньше пороговой даты
            user.createdAt = new Date(
                thresholdDate.getTime() - faker.number.int({ min: 1000, max: 10000 })
            );
            return user;
        });
    }
}
