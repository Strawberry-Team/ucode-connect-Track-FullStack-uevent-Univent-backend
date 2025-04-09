// src/auth/test/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { LoginDto } from '../../../src/auth/dto/login.dto';
import { ResetPasswordDto } from '../../../src/auth/dto/reset-password.dto';
import { newPasswordDto } from '../../../src/auth/dto/new-password.dto';
import { UsersTestUtils } from '../utils/users.faker.utils';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const authServiceMock = {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
            resetPasswordWithConfirmToken: jest.fn(),
            confirmEmail: jest.fn(),
            resetPassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: authServiceMock }],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register (POST /auth/register)', () => {
        it('should register a new user and return its result', async () => {
            // Arrange
            const createUserDto: CreateUserDto =
                UsersTestUtils.generateCreateUserDto();
            const registerResult = { user: UsersTestUtils.generateFakeUser() };
            authService.register.mockResolvedValue(registerResult);

            // Act
            const result = await authController.register(createUserDto);

            // Assert
            expect(authService.register).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(registerResult);
        });
    });

    describe('login (POST /auth/login)', () => {
        it('should login a user and return tokens and user info', async () => {
            // Arrange
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'Password123!$',
            };
            const loginResult = {
                user: {
                    id: 1,
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    profilePictureName: 'default.jpg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
            };
            authService.login.mockResolvedValue(loginResult);

            // Act
            const result = await authController.login(loginDto);

            // Assert
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(loginResult);
        });
    });

    describe('getCsrf (GET /auth/csrf-token)', () => {
        it('should return csrf token from request', () => {
            // Arrange
            const req = {
                csrfToken: () => 'dummyCsrfToken',
            } as any;

            // Act
            const result = authController.getCsrf(req);

            // Assert
            expect(result).toEqual({ csrfToken: 'dummyCsrfToken' });
        });
    });

    describe('logout (POST /auth/logout)', () => {
        it('should logout the user and return the result', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'testNonce';
            const logoutResult = { message: 'Logged out successfully' };
            authService.logout.mockResolvedValue(logoutResult);

            // Act
            const result = await authController.logout(userId, nonce);

            // Assert
            expect(authService.logout).toHaveBeenCalledWith(userId, nonce);
            expect(result).toEqual(logoutResult);
        });
    });

    describe('refreshToken (POST /auth/access-token/refresh)', () => {
        it('should refresh the token and return a new access token (or both tokens)', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'testNonce';
            const createdAt = 1600000000;
            const refreshResult = {
                accessToken: 'newAccessToken',
                newRefreshToken: 'newRefreshToken',
            };
            authService.refreshToken.mockResolvedValue(refreshResult);

            // Act
            const result = await authController.refreshToken(nonce, createdAt, userId);

            // Assert
            expect(authService.refreshToken).toHaveBeenCalledWith(
                userId,
                createdAt,
                nonce,
            );
            expect(result).toEqual(refreshResult);
        });
    });

    describe('resetPasswordWithConfirmToken (POST /auth/reset-password/:confirm_token)', () => {
        it('should reset the user password with confirm token and return a success message', async () => {
            // Arrange
            const userId = 1;
            const newPwdDto: newPasswordDto = { newPassword: 'NewPassword123!$' };
            const resetResult = {
                message: 'Password has been reset successfully',
            };
            authService.resetPasswordWithConfirmToken.mockResolvedValue(resetResult);

            // Act
            const result = await authController.resetPasswordWithConfirmToken(
                newPwdDto,
                userId,
            );

            // Assert
            expect(authService.resetPasswordWithConfirmToken).toHaveBeenCalledWith(
                newPwdDto,
                userId,
            );
            expect(result).toEqual(resetResult);
        });
    });

    describe('verifyEmailWithConfirmToken (POST /auth/confirm-email/:confirm_token)', () => {
        it('should confirm the email and return a success message', async () => {
            // Arrange
            const userId = 1;
            const confirmResult = { message: 'Email confirmed successfully' };
            authService.confirmEmail.mockResolvedValue(confirmResult);

            // Act
            const result = await authController.verifyEmailWithConfirmToken(userId);

            // Assert
            expect(authService.confirmEmail).toHaveBeenCalledWith(userId);
            expect(result).toEqual(confirmResult);
        });
    });

    describe('resetPassword (POST /auth/reset-password)', () => {
        it('should initiate a reset password process and return the result', async () => {
            // Arrange
            const resetPasswordDto: ResetPasswordDto = { email: 'test@example.com' };
            // For resetPassword, the service method might not return any data.
            authService.resetPassword.mockResolvedValue(undefined);

            // Act
            const result = await authController.resetPassword(resetPasswordDto);

            // Assert
            expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(result).toBeUndefined();
        });
    });
});
