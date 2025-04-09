// src/users/test/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { PasswordService } from '../../../src/users/passwords.service';
import { UsersTestUtils } from '../utils/users.faker.utils';
import { SERIALIZATION_GROUPS, User } from '../../../src/users/entity/user.entity';

describe('UsersService', () => {
    let usersService: UsersService;
    let usersRepository: jest.Mocked<UsersRepository>;
    let passwordService: jest.Mocked<PasswordService>;

    beforeEach(async () => {
        const usersRepositoryMock = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            getAllUnactivatedUsers: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const passwordServiceMock = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersRepository, useValue: usersRepositoryMock },
                { provide: PasswordService, useValue: passwordServiceMock },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        usersRepository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
        passwordService = module.get(
            PasswordService
        ) as jest.Mocked<PasswordService>;
    });

    describe('getUserById', () => {
        it('should return a user by id with confidential data', async () => {
            const testUser = UsersTestUtils.generateFakeUser();
            usersRepository.findById.mockResolvedValue(testUser);

            const result = await usersService.getUserById(testUser.id);

            expect(usersRepository.findById).toHaveBeenCalledWith(testUser.id);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                })
            );
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersRepository.findById.mockResolvedValue(null);
            const userId = 999;

            await expect(usersService.getUserById(userId)).rejects.toThrow(
                NotFoundException
            );
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('getUserByIdWithoutPassword', () => {
        it('should return a user by id without confidential data', async () => {
            const testUser = UsersTestUtils.generateFakeUser();
            usersRepository.findById.mockResolvedValue(testUser);

            const result = await usersService.getUserByIdWithoutPassword(testUser.id);

            expect(usersRepository.findById).toHaveBeenCalledWith(testUser.id);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersRepository.findById.mockResolvedValue(null);
            const userId = 999;

            await expect(
                usersService.getUserByIdWithoutPassword(userId)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('getUserByEmail', () => {
        it('should return a user by email with confidential data', async () => {
            const testUser = UsersTestUtils.generateFakeUser();
            usersRepository.findByEmail.mockResolvedValue(testUser);

            const result = await usersService.getUserByEmail(testUser.email);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(testUser.email);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                })
            );
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            const email = 'nonexistent@example.com';
            usersRepository.findByEmail.mockResolvedValue(null);

            await expect(usersService.getUserByEmail(email)).rejects.toThrow(
                NotFoundException
            );
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
        });
    });

    describe('getUserByEmailWithoutPassword', () => {
        it('should return a user by email without confidential data', async () => {
            const testUser = UsersTestUtils.generateFakeUser();
            usersRepository.findByEmail.mockResolvedValue(testUser);

            const result = await usersService.getUserByEmailWithoutPassword(
                testUser.email
            );

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(testUser.email);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            const email = 'nonexistent@example.com';
            usersRepository.findByEmail.mockResolvedValue(null);

            await expect(
                usersService.getUserByEmailWithoutPassword(email)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
        });
    });

    describe('getAllUnactivatedUsers', () => {
        it('should return all unactivated users', async () => {
            const time = 3600; // 1 hour
            const unactivatedUsers =
                UsersTestUtils.generateUnactivatedUsers(3, time);
            usersRepository.getAllUnactivatedUsers.mockResolvedValue(unactivatedUsers);

            const result = await usersService.getAllUnactivatedUsers(time);

            expect(usersRepository.getAllUnactivatedUsers).toHaveBeenCalledWith(time);
            expect(result).toHaveLength(unactivatedUsers.length);
            result.forEach((user, index) => {
                expect(user).toEqual(
                    plainToInstance(User, unactivatedUsers[index], {
                        groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                    })
                );
                expect(user.password).toBeDefined();
            });
        });

        it('should return an empty array if there are no unactivated users', async () => {
            const time = 3600;
            usersRepository.getAllUnactivatedUsers.mockResolvedValue([]);

            const result = await usersService.getAllUnactivatedUsers(time);

            expect(usersRepository.getAllUnactivatedUsers).toHaveBeenCalledWith(time);
            expect(result).toEqual([]);
        });
    });

    describe('createUser', () => {
        it('should create a new user and return it without confidential data', async () => {
            const createUserDto = UsersTestUtils.generateCreateUserDto();
            const hashedPassword = 'hashed_password_example';
            const createdUser = {
                ...UsersTestUtils.generateFakeUser(),
                ...createUserDto,
                password: hashedPassword,
            };

            usersRepository.findByEmail.mockResolvedValue(null);
            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.create.mockResolvedValue(createdUser);

            const result = await usersService.createUser(createUserDto);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(usersRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: hashedPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, createdUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw ConflictException if email is already in use', async () => {
            const createUserDto = UsersTestUtils.generateCreateUserDto();
            const existingUser = UsersTestUtils.generateFakeUser();
            existingUser.email = createUserDto.email;

            usersRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(usersService.createUser(createUserDto)).rejects.toThrow(
                ConflictException
            );
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(passwordService.hash).not.toHaveBeenCalled();
            expect(usersRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update a user and return updated data without confidential fields', async () => {
            const userId = 1;
            const updateUserDto = UsersTestUtils.generateUpdateUserDto();
            const updatedUser = {
                ...UsersTestUtils.generateFakeUser(),
                id: userId,
                ...updateUserDto,
            };

            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updateUser(userId, updateUserDto);

            expect(usersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found during update', async () => {
            const userId = 999;
            const updateUserDto = UsersTestUtils.generateUpdateUserDto();

            usersRepository.update.mockResolvedValue(null);

            await expect(usersService.updateUser(userId, updateUserDto)).rejects.toThrow(
                NotFoundException
            );
            expect(usersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
        });
    });

    describe('updateUserPassword', () => {
        it('should update user password when old password matches', async () => {
            const userId = 1;
            const oldPassword = 'old_password';
            const newPassword = 'new_password';
            const hashedNewPassword = 'hashed_new_password';

            const updateUserPasswordDto = {
                oldPassword,
                newPassword,
            };

            const user = {
                ...UsersTestUtils.generateFakeUser(),
                id: userId,
                password: 'hashed_old_password',
            };

            const updatedUser = { ...user, password: hashedNewPassword };

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);
            passwordService.hash.mockResolvedValue(hashedNewPassword);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updateUserPassword(
                userId,
                updateUserPasswordDto
            );

            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                oldPassword,
                user.password
            );
            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedNewPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw UnauthorizedException if old password does not match', async () => {
            const userId = 1;
            const updateUserPasswordDto =
                UsersTestUtils.generateUpdateUserPasswordDto();
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(false);

            await expect(
                usersService.updateUserPassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(UnauthorizedException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                updateUserPasswordDto.oldPassword,
                user.password
            );
            expect(passwordService.hash).not.toHaveBeenCalled();
            expect(usersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if user is not found when updating password', async () => {
            const userId = 999;
            const updateUserPasswordDto =
                UsersTestUtils.generateUpdateUserPasswordDto();

            usersRepository.findById.mockResolvedValue(null);

            await expect(
                usersService.updateUserPassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if update fails after password hash', async () => {
            const userId = 1;
            const updateUserPasswordDto =
                UsersTestUtils.generateUpdateUserPasswordDto();
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);
            passwordService.hash.mockResolvedValue('hashed_password');
            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.updateUserPassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                updateUserPasswordDto.oldPassword,
                user.password
            );
            expect(passwordService.hash).toHaveBeenCalledWith(updateUserPasswordDto.newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: 'hashed_password',
            });
        });
    });

    describe('updateUserAvatar', () => {
        it('should update user avatar and return updated data', async () => {
            const userId = 1;
            const profilePictureName = UsersTestUtils.generateFakeProfilePictureName();
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;

            const updatedUser = { ...user, profilePictureName };

            usersRepository.findById.mockResolvedValue(user);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updateUserAvatar(userId, profilePictureName);

            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                profilePictureName,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.profilePictureName).toBe(profilePictureName);
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user not found for avatar update', async () => {
            const userId = 999;
            const profilePictureName = UsersTestUtils.generateFakeProfilePictureName();

            usersRepository.findById.mockResolvedValue(null);

            await expect(
                usersService.updateUserAvatar(userId, profilePictureName)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if update fails during avatar update', async () => {
            const userId = 1;
            const profilePictureName = UsersTestUtils.generateFakeProfilePictureName();
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.updateUserAvatar(userId, profilePictureName)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                profilePictureName,
            });
        });
    });

    describe('updatePassword', () => {
        it('should update user password and return updated data', async () => {
            const userId = 1;
            const newPassword = 'new_password';
            const hashedPassword = 'hashed_new_password';
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;
            const updatedUser = { ...user, password: hashedPassword };

            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updatePassword(userId, newPassword);

            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found when updating password', async () => {
            const userId = 999;
            const newPassword = 'new_password';
            const hashedPassword = 'hashed_password';

            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.update.mockResolvedValue(null);

            await expect(usersService.updatePassword(userId, newPassword)).rejects.toThrow(
                NotFoundException
            );
            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
        });
    });

    describe('confirmEmail', () => {
        it('should confirm user email and return updated data', async () => {
            const userId = 1;
            const user = UsersTestUtils.generateFakeUser();
            user.id = userId;
            user.isEmailVerified = false;
            const updatedUser = { ...user, isEmailVerified: true };

            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.confirmEmail(userId);

            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                isEmailVerified: true,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const userId = 1;
            usersRepository.delete.mockResolvedValue(undefined);

            await usersService.deleteUser(userId);

            expect(usersRepository.delete).toHaveBeenCalledWith(userId);
        });

        it('should propagate error if deletion fails', async () => {
            const userId = 1;
            const error = new Error('Database error');
            usersRepository.delete.mockRejectedValue(error);

            await expect(usersService.deleteUser(userId)).rejects.toThrow(error);
            expect(usersRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
