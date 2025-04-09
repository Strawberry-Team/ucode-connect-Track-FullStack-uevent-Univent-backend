// src/auth/test/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/users/users.service';
import { RefreshTokenNonceService } from '../../../src/refresh-token-nonces/refresh-token-nonce.service';
import { RefreshTokenNonce } from '../../../src/refresh-token-nonces/entity/refresh-token-nonce.entity';
import { User } from '../../../src/users/entity/user.entity';
import { JwtUtils } from '../../../src/jwt/jwt-token.utils';
import { PasswordService } from '../../../src/users/passwords.service';
import { EmailService } from '../../../src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { NonceUtils } from '../../../src/common/utils/nonce.utils';
import { UsersTestUtils } from '../utils/users.faker.utils';

// Helper to create mock RefreshTokenNonce objects
const createMockRefreshTokenNonce = (overrides = {}): RefreshTokenNonce => ({
    id: 101,
    userId: 1,
    nonce: 'test-nonce',
    createdAt: new Date(),
    ...overrides
});

// Мокаем convertToSeconds, чтобы возвращать фиксированное значение для '1d'
jest.mock('../../../src/common/utils/time.utils', () => ({
    convertToSeconds: jest.fn(() => 86400), // 1 day in seconds
}));

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let refreshTokenNonceService: jest.Mocked<RefreshTokenNonceService>;
    let jwtUtils: jest.Mocked<JwtUtils>;
    let passwordService: jest.Mocked<PasswordService>;
    let emailService: jest.Mocked<EmailService>;
    let configService: jest.Mocked<ConfigService>;
    let nonceUtils: jest.Mocked<NonceUtils>;

    beforeEach(async () => {
        const usersServiceMock = {
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
            updatePassword: jest.fn(),
            confirmEmail: jest.fn(),
        };

        const refreshTokenNonceServiceMock = {
            createRefreshTokenNonce: jest.fn(),
            getRefreshTokenNonceByNonceAndUserId: jest.fn(),
            deleteRefreshTokenNonceByNonceId: jest.fn(),
            deleteRefreshTokenNoncesByUserId: jest.fn(),
        };

        const jwtUtilsMock = {
            generateToken: jest.fn(),
        };

        const passwordServiceMock = {
            compare: jest.fn(),
        };

        const emailServiceMock = {
            sendConfirmationEmail: jest.fn(),
            sendResetPasswordEmail: jest.fn(),
        };

        const configServiceMock = {
            get: jest.fn((key) => {
                if (key === 'app.frontendLink') return 'http://frontend/';
                return undefined;
            }),
        };

        const nonceUtilsMock = {
            generateNonce: jest.fn(),
        };


        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersServiceMock },
                { provide: RefreshTokenNonceService, useValue: refreshTokenNonceServiceMock },
                { provide: JwtUtils, useValue: jwtUtilsMock },
                { provide: PasswordService, useValue: passwordServiceMock },
                { provide: EmailService, useValue: emailServiceMock },
                { provide: ConfigService, useValue: configServiceMock },
                { provide: NonceUtils, useValue: nonceUtilsMock },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        refreshTokenNonceService = module.get(RefreshTokenNonceService);
        jwtUtils = module.get(JwtUtils);
        passwordService = module.get(PasswordService);
        emailService = module.get(EmailService);
        configService = module.get(ConfigService);
        nonceUtils = module.get(NonceUtils);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        it('should register a new user and send confirmation email', async () => {
            // Arrange
            const createUserDto = UsersTestUtils.generateCreateUserDto();
            const createdUser = UsersTestUtils.generateFakeUser();
            usersService.createUser.mockResolvedValue(createdUser);

            // Spy on sendConfirmationEmail (internal method)
            const sendConfirmationEmailSpy = jest
                .spyOn(authService, 'sendConfirmationEmail')
                .mockImplementation(() => Promise.resolve());

            // Act
            const result = await authService.register(createUserDto);

            // Assert
            expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
            expect(sendConfirmationEmailSpy).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual({ user: createdUser });
        });
    });

    describe('sendConfirmationEmail', () => {
        it('should generate a token and send confirmation email', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            const generatedToken = 'dummyConfirmationToken';
            jwtUtils.generateToken.mockReturnValue(generatedToken);

            // Mock the config properly - the issue is likely with the key path
            configService.get.mockImplementation((path) => {
                if (path === 'app.frontendLink') {
                    return 'http://frontend/';
                }
                return undefined;
            });

            // Act
            await authService.sendConfirmationEmail(user);

            // Assert
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id },
                'confirmEmail',
            );
            const expectedLink = 'http://frontend/auth/confirm-email/' + generatedToken;
            expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
                user.email,
                expectedLink,
            );
        });
    });

    describe('login', () => {
        const loginDto = { email: 'test@example.com', password: 'Password123!$' };
        it('should login the user and return tokens and user data without sensitive fields', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            // Ensure sensitive fields are set
            user.password = 'hashedPassword';
            user.isEmailVerified = true;
            usersService.getUserByEmail.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);
            nonceUtils.generateNonce.mockReturnValue('newNonce');
            jwtUtils.generateToken.mockImplementation((payload, type) => {
                if (type === 'access') return 'accessToken';
                if (type === 'refresh') return 'refreshToken';
                return 'token';
            });
            refreshTokenNonceService.createRefreshTokenNonce.mockResolvedValue(
                createMockRefreshTokenNonce()
            );

            // Act
            const result = await authService.login(loginDto);

            // Assert
            expect(usersService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(passwordService.compare).toHaveBeenCalledWith(
                loginDto.password,
                user.password,
            );
            expect(nonceUtils.generateNonce).toHaveBeenCalled();
            expect(jwtUtils.generateToken).toHaveBeenCalledWith({ sub: user.id }, 'access');
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id, nonce: 'newNonce' },
                'refresh',
            );
            expect(refreshTokenNonceService.createRefreshTokenNonce).toHaveBeenCalledWith({
                userId: user.id,
                nonce: 'newNonce',
            });
            const { password, isEmailVerified, refreshTokenNonces, ...userWithoutSensitive } =
                user;
            expect(result).toEqual({
                user: userWithoutSensitive,
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
            });
        });

        it('should throw UnauthorizedException if the password is invalid', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            user.password = 'hashedPassword';
            user.isEmailVerified = true;
            usersService.getUserByEmail.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(false);

            // Act & Assert
            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(passwordService.compare).toHaveBeenCalledWith(
                loginDto.password,
                user.password,
            );
        });

        it('should throw ForbiddenException if the email is not verified', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            user.password = 'hashedPassword';
            user.isEmailVerified = false;
            usersService.getUserByEmail.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);

            // Act & Assert
            await expect(authService.login(loginDto)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('logout', () => {
        it('should logout the user successfully when refresh token nonce is found', async () => {
            // Arrange
            const userId = 1;
            const refreshNonce = 'existingNonce';
            const nonceEntity = createMockRefreshTokenNonce({ id: 101 });
            refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                nonceEntity,
            );
            refreshTokenNonceService.deleteRefreshTokenNonceByNonceId.mockResolvedValue();

            // Act
            const result = await authService.logout(userId, refreshNonce);

            // Assert
            expect(
                refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId,
            ).toHaveBeenCalledWith(userId, refreshNonce);
            expect(
                refreshTokenNonceService.deleteRefreshTokenNonceByNonceId,
            ).toHaveBeenCalledWith(nonceEntity.id);
            expect(result).toEqual({ message: 'Logged out successfully' });
        });

        it('should throw NotFoundException if refresh token nonce is not found', async () => {
            // Arrange
            const userId = 1;
            const refreshNonce = 'nonexistentNonce';
            refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                null as unknown as RefreshTokenNonce,
            );

            // Act & Assert
            await expect(authService.logout(userId, refreshNonce)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('refreshToken', () => {
        const userId = 1;
        const refreshNonce = 'oldNonce';

        describe('when refresh token is expired', () => {
            it('should generate a new refresh token and delete the old nonce', async () => {
                // Arrange
                // Set current time (in seconds) and createdAt such that (now - createdAt) > 86400.
                const fakeCurrentTimeSeconds = 200000;
                const fakeCreatedAt = fakeCurrentTimeSeconds - 86400 - 1; // expired
                jest.spyOn(Date.prototype, 'getTime').mockReturnValue(fakeCurrentTimeSeconds * 1000);

                nonceUtils.generateNonce.mockReturnValue('newNonce');
                jwtUtils.generateToken.mockImplementation((payload, type) => {
                    if (type === 'access') return 'accessToken';
                    if (type === 'refresh') return 'newRefreshToken';
                    return 'token';
                });
                refreshTokenNonceService.createRefreshTokenNonce.mockResolvedValue(
                    createMockRefreshTokenNonce({ nonce: 'newNonce' })
                );
                const nonceEntity = createMockRefreshTokenNonce({ id: 101 });
                refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                    nonceEntity,
                );
                refreshTokenNonceService.deleteRefreshTokenNonceByNonceId.mockResolvedValue();

                // Act
                const result = await authService.refreshToken(userId, fakeCreatedAt, refreshNonce);

                // Assert
                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId },
                    'access',
                );
                expect(nonceUtils.generateNonce).toHaveBeenCalled();
                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId, nonce: 'newNonce' },
                    'refresh',
                );
                expect(refreshTokenNonceService.createRefreshTokenNonce).toHaveBeenCalledWith({
                    userId,
                    nonce: 'newNonce',
                });
                expect(
                    refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId,
                ).toHaveBeenCalledWith(userId, refreshNonce);
                expect(
                    refreshTokenNonceService.deleteRefreshTokenNonceByNonceId,
                ).toHaveBeenCalledWith(nonceEntity.id);
                expect(result).toEqual({
                    accessToken: 'accessToken',
                    newRefreshToken: 'newRefreshToken',
                });
            });
        });

        describe('when refresh token is not expired', () => {
            it('should return only a new access token without refreshing nonce', async () => {
                // Arrange
                // Set current time such that (now - createdAt) <= 86400.
                const fakeCurrentTimeSeconds = 200000;
                const fakeCreatedAt = fakeCurrentTimeSeconds - 1000; // not expired
                jest.spyOn(Date.prototype, 'getTime').mockReturnValue(fakeCurrentTimeSeconds * 1000);

                jwtUtils.generateToken.mockReturnValue('accessToken');

                // Act
                const result = await authService.refreshToken(userId, fakeCreatedAt, refreshNonce);

                // Assert
                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId },
                    'access',
                );
                // In this branch no new nonce is generated so these methods should not be called.
                expect(nonceUtils.generateNonce).not.toHaveBeenCalled();
                expect(refreshTokenNonceService.createRefreshTokenNonce).not.toHaveBeenCalled();
                expect(result).toEqual({ accessToken: 'accessToken' });
            });
        });
    });

    describe('resetPasswordWithConfirmToken', () => {
        it('should update user password and delete all refresh token nonces', async () => {
            // Arrange
            const userId = 1;
            const newPasswordDto = { newPassword: 'NewPassword123!$' };
            usersService.updatePassword.mockResolvedValue(UsersTestUtils.generateFakeUser());
            refreshTokenNonceService.deleteRefreshTokenNoncesByUserId.mockResolvedValue();

            // Act
            const result = await authService.resetPasswordWithConfirmToken(newPasswordDto, userId);

            // Assert
            expect(usersService.updatePassword).toHaveBeenCalledWith(
                userId,
                newPasswordDto.newPassword,
            );
            expect(
                refreshTokenNonceService.deleteRefreshTokenNoncesByUserId,
            ).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'Password has been reset successfully' });
        });
    });

    describe('resetPassword', () => {
        it('should throw NotFoundException if user is not found', async () => {
            // Arrange
            const resetPasswordDto = { email: 'notfound@example.com' };
            usersService.getUserByEmail.mockResolvedValue(null as unknown as User);

            // Act & Assert
            await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException if user is not verified', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            user.isEmailVerified = false;
            const resetPasswordDto = { email: user.email };
            usersService.getUserByEmail.mockResolvedValue(user);

            // Act & Assert
            await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should generate a reset token and send a reset password email', async () => {
            // Arrange
            const user = UsersTestUtils.generateFakeUser();
            user.isEmailVerified = true;
            const resetPasswordDto = { email: user.email };
            usersService.getUserByEmail.mockResolvedValue(user);
            jwtUtils.generateToken.mockReturnValue('resetPasswordToken');

            // Act
            await authService.resetPassword(resetPasswordDto);

            // Assert
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id },
                'resetPassword',
            );
            const expectedLink = 'http://frontend/auth/reset-password/resetPasswordToken';
            expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
                user.email,
                expectedLink,
            );
        });
    });

    describe('confirmEmail', () => {
        it('should confirm the user email and return success message', async () => {
            // Arrange
            const userId = 1;
            usersService.confirmEmail.mockResolvedValue(UsersTestUtils.generateFakeUser());

            // Act
            const result = await authService.confirmEmail(userId);

            // Assert
            expect(usersService.confirmEmail).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'Email confirmed successfully' });
        });
    });
});
