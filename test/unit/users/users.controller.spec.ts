// test/unit/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    NotFoundException,
    NotImplementedException,
} from '@nestjs/common';
import { UsersController } from '../../../src/models/users/users.controller'
import { UsersService } from '../../../src/models/users/users.service';
import * as UsersFaker from '../../../test/fake-data/fake-users';
import { User } from '../../../src/models/users/entities/user.entity';

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: jest.Mocked<UsersService>;

    beforeEach(async () => {
        const usersServiceMock = {
            findUserByIdWithoutPassword: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            findUserByEmailWithoutPassword: jest.fn(),
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

    describe('findOneByEmail (GET /users?email=...)', () => {
        it('should throw BadRequestException if email is not provided', async () => {
            await expect(usersController.findAll('')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should return user by email without PRIVATE data', async () => {
            const testUser: User = UsersFaker.generateFakeUser();
            usersService.findUserByEmailWithoutPassword.mockResolvedValue(testUser);

            const result = await usersController.findAll(testUser.email);
            expect(usersService.findUserByEmailWithoutPassword).toHaveBeenCalledWith(
                testUser.email,
            );
            expect(result).toEqual(testUser);
        });
    });

    describe('findOne (GET /users/:id)', () => {
        it('should return user by id without PRIVATE data', async () => {
            const testUser: User = UsersFaker.generateFakeUser();
            usersService.findUserByIdWithoutPassword.mockResolvedValue(testUser);

            const id = testUser.id;
            const dummyUserId = 123;

            const result = await usersController.findOne(id, dummyUserId);
            expect(usersService.findUserByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(result).toEqual(testUser);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const id = 999;
            const dummyUserId = 123;
            usersService.findUserByIdWithoutPassword.mockResolvedValue(null as unknown as User);
            await expect(usersController.findOne(id, dummyUserId)).rejects.toThrow(
                NotFoundException,
            );
            expect(usersService.findUserByIdWithoutPassword).toHaveBeenCalledWith(id);
        });
    });

    describe('create (POST /users)', () => {
        it('should throw NotImplementedException when called', async () => {
            const createUserDto = UsersFaker.generateCreateUserDto();
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
            const updateUserDto = UsersFaker.generateUpdateUserDto();

            const existingUser: User = UsersFaker.generateFakeUser();
            const updatedUser: User = { ...existingUser, ...updateUserDto };

            usersService.findUserByIdWithoutPassword.mockResolvedValue(existingUser);
            usersService.updateUser.mockResolvedValue(updatedUser);

            const result = await usersController.update(id, updateUserDto, dummyUserId);
            expect(usersService.findUserByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(usersService.updateUser).toHaveBeenCalledWith(id, updateUserDto);
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException if user to update is not found', async () => {
            const id = 999;
            const dummyUserId = 123;
            const updateUserDto = UsersFaker.generateUpdateUserDto();

            usersService.findUserByIdWithoutPassword.mockResolvedValue(null as unknown as User);

            await expect(
                usersController.update(id, updateUserDto, dummyUserId),
            ).rejects.toThrow(NotFoundException);
            expect(usersService.findUserByIdWithoutPassword).toHaveBeenCalledWith(id);
        });
    });

    describe('updatePassword (PATCH /users/:id/password)', () => {
        it('should update user password and return updated data', async () => {
            const id = 1;
            const updateUserPasswordDto = UsersFaker.generateUpdateUserPasswordDto();
            const updatedUser: User = UsersFaker.generateFakeUser();
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
            const updateUserPasswordDto = UsersFaker.generateUpdateUserPasswordDto();
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
            const fileMock = {
                fieldname: 'file',
                originalname: 'avatar.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                destination: './public/uploads/avatars',
                filename: 'avatar-uuid.jpg',
                path: './public/uploads/avatars/avatar-uuid.jpg',
                buffer: Buffer.from('test'),
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
            await expect(usersController.remove(id, dummyUserId)).rejects.toThrow(
                NotImplementedException,
            );
        });
    });
});
