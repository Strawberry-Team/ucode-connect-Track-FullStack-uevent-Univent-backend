// src/users/test/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    NotFoundException,
    NotImplementedException,
} from '@nestjs/common';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { UsersTestUtils } from '../utils/users.faker.utils';
import { User } from '../../../src/users/entity/user.entity';

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: jest.Mocked<UsersService>;

    beforeEach(async () => {
        const usersServiceMock = {
            getUserByIdWithoutPassword: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getUserByEmailWithoutPassword: jest.fn(),
            updateUserPassword: jest.fn(),
            updateUserAvatar: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: usersServiceMock }],
        }).compile();

        usersController = module.get<UsersController>(UsersController);
        usersService = module.get(UsersService);
    });

    describe('findOne (GET /users?email=...)', () => {
        it('should throw BadRequestException if email is not provided', async () => {
            await expect(usersController.findOne('')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should return user by email without confidential data', async () => {
            const testUser: User = UsersTestUtils.generateFakeUser();
            usersService.getUserByEmailWithoutPassword.mockResolvedValue(testUser);

            const result = await usersController.findOne(testUser.email);
            expect(usersService.getUserByEmailWithoutPassword).toHaveBeenCalledWith(
                testUser.email,
            );
            expect(result).toEqual(testUser);
        });
    });

    describe('getById (GET /users/:id)', () => {
        it('should return user by id without confidential data', async () => {
            const testUser: User = UsersTestUtils.generateFakeUser();
            // Метод findById контроллера вызывает usersService.getUserByIdWithoutPassword
            usersService.getUserByIdWithoutPassword.mockResolvedValue(testUser);

            const id = testUser.id;
            const dummyUserId = 123; // произвольный id аутентифицированного пользователя

            const result = await usersController.getById(id, dummyUserId);
            expect(usersService.getUserByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(result).toEqual(testUser);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const id = 999;
            const dummyUserId = 123;
            usersService.getUserByIdWithoutPassword.mockResolvedValue(null as unknown as User);
            await expect(usersController.getById(id, dummyUserId)).rejects.toThrow(
                NotFoundException,
            );
            expect(usersService.getUserByIdWithoutPassword).toHaveBeenCalledWith(id);
        });
    });

    describe('create (POST /users)', () => {
        it('should throw NotImplementedException when called', async () => {
            const createUserDto = UsersTestUtils.generateCreateUserDto();
            const dummyUserId = 123;
            await expect(
                usersController.create(createUserDto, dummyUserId),
            ).rejects.toThrow(NotImplementedException);
        });
    });

    describe('update (PATCH /users/:id)', () => {
        it('should update user and return updated data', async () => {
            const id = 1;
            const dummyUserId = 123;
            const updateUserDto = UsersTestUtils.generateUpdateUserDto();

            const existingUser: User = UsersTestUtils.generateFakeUser();
            const updatedUser: User = { ...existingUser, ...updateUserDto };
            // Имитируем корректное получение сущности
            usersService.getUserByIdWithoutPassword.mockResolvedValue(existingUser);
            // Имитируем успешное обновление
            usersService.updateUser.mockResolvedValue(updatedUser);

            const result = await usersController.update(id, updateUserDto, dummyUserId);
            expect(usersService.getUserByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(usersService.updateUser).toHaveBeenCalledWith(id, updateUserDto);
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException if user to update is not found', async () => {
            const id = 999;
            const dummyUserId = 123;
            const updateUserDto = UsersTestUtils.generateUpdateUserDto();

            usersService.getUserByIdWithoutPassword.mockResolvedValue(null as unknown as User);

            await expect(
                usersController.update(id, updateUserDto, dummyUserId),
            ).rejects.toThrow(NotFoundException);
            expect(usersService.getUserByIdWithoutPassword).toHaveBeenCalledWith(id);
        });
    });

    describe('updatePassword (PATCH /users/:id/password)', () => {
        it('should update user password and return updated data', async () => {
            const id = 1;
            const updateUserPasswordDto =
                UsersTestUtils.generateUpdateUserPasswordDto();
            const updatedUser: User = UsersTestUtils.generateFakeUser();
            usersService.updateUserPassword.mockResolvedValue(updatedUser);

            const result = await usersController.updatePassword(id, updateUserPasswordDto);
            expect(usersService.updateUserPassword).toHaveBeenCalledWith(
                id,
                updateUserPasswordDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should propagate error if service.updateUserPassword throws error', async () => {
            const id = 1;
            const updateUserPasswordDto =
                UsersTestUtils.generateUpdateUserPasswordDto();
            const error = new NotFoundException('User not found');
            usersService.updateUserPassword.mockRejectedValue(error);

            await expect(
                usersController.updatePassword(id, updateUserPasswordDto),
            ).rejects.toThrow(error);
            expect(usersService.updateUserPassword).toHaveBeenCalledWith(
                id,
                updateUserPasswordDto,
            );
        });
    });

    describe('uploadAvatar (POST /users/:id/upload-avatar)', () => {
        it('should update user avatar and return file info when file is provided', async () => {
            const id = 1;
            // Complete Express.Multer.File mock with required properties
            const fileMock = {
                fieldname: 'file', // Note: should match the field name in FileInterceptor
                originalname: 'avatar.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                destination: './public/uploads/avatars',
                filename: 'avatar-uuid.jpg',
                path: './public/uploads/avatars/avatar-uuid.jpg',
                buffer: Buffer.from('test'),
                // Add missing stream property to satisfy the type
                stream: jest.fn() as any
            } as Express.Multer.File;

            const result = await usersController.uploadAvatar(fileMock, id);
            expect(usersService.updateUserAvatar).toHaveBeenCalledWith(
                id,
                fileMock.filename,
            );
            expect(result).toEqual({ server_filename: fileMock.filename });
        });

        it('should throw BadRequestException if no file is uploaded', async () => {
            const id = 1;
            // Fix: Use type assertion to handle the null case
            await expect(usersController.uploadAvatar(undefined as any, id)).rejects.toThrow(
                BadRequestException,
            );
            expect(usersService.updateUserAvatar).not.toHaveBeenCalled();
        });
    });

    describe('delete (DELETE /users/:id)', () => {
        it('should throw NotImplementedException when delete is called', async () => {
            const id = 1;
            const dummyUserId = 123;
            await expect(usersController.delete(id, dummyUserId)).rejects.toThrow(
                NotImplementedException,
            );
        });
    });
});
