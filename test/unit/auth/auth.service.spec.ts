// test/unit/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../src/models/auth/auth.service';
import { UsersService } from '../../../src/models/users/users.service';
import { RefreshTokenNoncesService } from '../../../src/models/refresh-token-nonces/refresh-token-nonces.service';
import { RefreshTokenNonce } from '../../../src/models/refresh-token-nonces/entities/refresh-token-nonce.entity';
import { User } from '../../../src/models/users/entities/user.entity';
import { JwtUtils } from '../../../src/jwt/jwt-token.utils';
import { HashingPasswordsService } from '../../../src/models/users/hashing-passwords.service';
import { EmailService } from '../../../src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { NonceUtils } from '../../../src/common/utils/nonce.utils';
import {
    generateCreateUserDto,
    generateFakeUser,
    generateUnactivatedUsers,
    generateFakeUserWithFields,
    generateFakeUsers,
    generateUpdateUserDto,
    generateUpdateUserPasswordDto,
} from '../../fake-data/fake-users';

const createMockRefreshTokenNonce = (
    overrides = {}
): RefreshTokenNonce => ({
    id: 101,
    userId: 1,
    nonce: 'test-nonce',
    createdAt: new Date(),
    ...overrides,
});

jest.mock('../../../src/common/utils/time.utils', () => ({
    convertToSeconds: jest.fn(() => 86400),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let refreshTokenNonceService: jest.Mocked<RefreshTokenNoncesService>;
    let jwtUtils: jest.Mocked<JwtUtils>;
    let passwordService: jest.Mocked<HashingPasswordsService>;
    let emailService: jest.Mocked<EmailService>;
    let configService: jest.Mocked<ConfigService>;
    let nonceUtils: jest.Mocked<NonceUtils>;

    beforeEach(async () => {
        const usersServiceMock = {
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
            resetUserPassword: jest.fn(),
            confirmUserEmail: jest.fn(),
        };

        const refreshTokenNonceServiceMock = {
            createRefreshTokenNonce: jest.fn(),
            findRefreshTokenNonceByNonceAndUserId: jest.fn(),
            deleteRefreshTokenNonceById: jest.fn(),
            deleteRefreshTokenNonceByUserId: jest.fn(),
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
                {
                    provide: RefreshTokenNoncesService,
                    useValue: refreshTokenNonceServiceMock,
                },
                { provide: JwtUtils, useValue: jwtUtilsMock },
                { provide: HashingPasswordsService, useValue: passwordServiceMock },
                { provide: EmailService, useValue: emailServiceMock },
                { provide: ConfigService, useValue: configServiceMock },
                { provide: NonceUtils, useValue: nonceUtilsMock },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        refreshTokenNonceService = module.get(
            RefreshTokenNoncesService
        );
        jwtUtils = module.get(JwtUtils);
        passwordService = module.get(HashingPasswordsService);
        emailService = module.get(EmailService);
        configService = module.get(ConfigService);
        nonceUtils = module.get(NonceUtils);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        it('should register a new user and send confirmation email', async () => {
            const createUserDto = generateCreateUserDto();
            const createdUser = generateFakeUser();
            usersService.createUser.mockResolvedValue(createdUser);

            // Для проверки вызова приватного метода используем spy через bracket notation
            const sendConfirmationEmailSpy = jest.spyOn(
                // @ts-ignore
                authService as any,
                'sendConfirmationEmail'
            );

            const result = await authService.register(createUserDto);

            expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
            expect(sendConfirmationEmailSpy).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual({ user: createdUser });
        });
    });

    describe('sendConfirmationEmail', () => {
        it('should generate a token and send confirmation email', async () => {
            const user = generateFakeUser();
            const generatedToken = 'dummyConfirmationToken';
            jwtUtils.generateToken.mockReturnValue(generatedToken);

            configService.get.mockImplementation((path) => {
                if (path === 'app.frontendLink') {
                    return 'http://frontend/';
                }
                return undefined;
            });

            // Вызываем приватный метод через bracket notation
            await (authService as any).sendConfirmationEmail(user);

            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id },
                'confirmEmail'
            );
            const expectedLink =
                'http://frontend/' + 'auth/confirm-email/' + generatedToken;
            expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
                user.email,
                expectedLink,
                `${user.firstName}${!user.lastName ? '' : user.lastName}`
            );
        });
    });

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'Password123!$',
        };

        it('should login the user and return tokens and user data without sensitive fields', async () => {
            const user = generateFakeUser();
            user.password = 'hashedPassword';
            user.isEmailVerified = true;
            usersService.findUserByEmail.mockResolvedValue(user);
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

            const result = await authService.login(loginDto);

            expect(usersService.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(passwordService.compare).toHaveBeenCalledWith(
                loginDto.password,
                user.password
            );
            expect(nonceUtils.generateNonce).toHaveBeenCalled();
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id },
                'access'
            );
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id, nonce: 'newNonce' },
                'refresh'
            );
            expect(
                refreshTokenNonceService.createRefreshTokenNonce
            ).toHaveBeenCalledWith({
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
            const user = generateFakeUser();
            user.password = 'hashedPassword';
            user.isEmailVerified = true;
            usersService.findUserByEmail.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(false);

            await expect(authService.login(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
            expect(passwordService.compare).toHaveBeenCalledWith(
                loginDto.password,
                user.password
            );
        });

        it('should throw ForbiddenException if the email is not verified', async () => {
            const user = generateFakeUser();
            user.password = 'hashedPassword';
            user.isEmailVerified = false;
            usersService.findUserByEmail.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);

            await expect(authService.login(loginDto)).rejects.toThrow(
                ForbiddenException
            );
        });
    });

    describe('logout', () => {
        it('should logout the user successfully when refresh token nonce is found', async () => {
            const userId = 1;
            const refreshNonce = 'existingNonce';
            const nonceEntity = createMockRefreshTokenNonce({ id: 101 });
            refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                nonceEntity
            );
            refreshTokenNonceService.deleteRefreshTokenNonceById.mockResolvedValue();

            const result = await authService.logout(userId, refreshNonce);

            expect(
                refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId
            ).toHaveBeenCalledWith(userId, refreshNonce);
            expect(
                refreshTokenNonceService.deleteRefreshTokenNonceById
            ).toHaveBeenCalledWith(nonceEntity.id);
            expect(result).toEqual({ message: 'Logged out successfully' });
        });

        it('should throw NotFoundException if refresh token nonce is not found', async () => {
            const userId = 1;
            const refreshNonce = 'nonexistentNonce';
            refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                null as unknown as RefreshTokenNonce,
            );


            await expect(authService.logout(userId, refreshNonce)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('refreshAccessToken', () => {
        const userId = 1;
        const refreshNonce = 'oldNonce';

        describe('when refresh token is expired', () => {
            it('should generate a new refresh token and delete the old nonce', async () => {
                const fakeCurrentTimeSeconds = 200000;
                const fakeCreatedAt = fakeCurrentTimeSeconds - 86400 - 1;
                jest.spyOn(Date.prototype, 'getTime').mockReturnValue(
                    fakeCurrentTimeSeconds * 1000
                );

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
                refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId.mockResolvedValue(
                    nonceEntity
                );
                refreshTokenNonceService.deleteRefreshTokenNonceById.mockResolvedValue();

                const result = await authService.refreshAccessToken(
                    userId,
                    fakeCreatedAt,
                    refreshNonce
                );

                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId },
                    'access'
                );
                expect(nonceUtils.generateNonce).toHaveBeenCalled();
                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId, nonce: 'newNonce' },
                    'refresh'
                );
                expect(
                    refreshTokenNonceService.createRefreshTokenNonce
                ).toHaveBeenCalledWith({ userId, nonce: 'newNonce' });
                expect(
                    refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId
                ).toHaveBeenCalledWith(userId, refreshNonce);
                expect(
                    refreshTokenNonceService.deleteRefreshTokenNonceById
                ).toHaveBeenCalledWith(nonceEntity.id);
                expect(result).toEqual({
                    accessToken: 'accessToken',
                    newRefreshToken: 'newRefreshToken',
                });
            });
        });

        describe('when refresh token is not expired', () => {
            it('should return only a new access token without refreshing nonce', async () => {
                const fakeCurrentTimeSeconds = 200000;
                const fakeCreatedAt = fakeCurrentTimeSeconds - 1000;
                jest.spyOn(Date.prototype, 'getTime').mockReturnValue(
                    fakeCurrentTimeSeconds * 1000
                );

                jwtUtils.generateToken.mockReturnValue('accessToken');

                const result = await authService.refreshAccessToken(
                    userId,
                    fakeCreatedAt,
                    refreshNonce
                );

                expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                    { sub: userId },
                    'access'
                );
                expect(nonceUtils.generateNonce).not.toHaveBeenCalled();
                expect(
                    refreshTokenNonceService.createRefreshTokenNonce
                ).not.toHaveBeenCalled();
                expect(result).toEqual({ accessToken: 'accessToken' });
            });
        });
    });

    describe('resetPassword', () => {
        it('should throw NotFoundException if user is not found', async () => {
            const resetPasswordDto = { email: 'notfound@example.com' };
            usersService.findUserByEmail.mockResolvedValue(
                null as unknown as User,
            );
            await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw NotFoundException if user is not verified', async () => {
            const user = generateFakeUser();
            user.isEmailVerified = false;
            const resetPasswordDto = { email: user.email };
            usersService.findUserByEmail.mockResolvedValue(user);

            await expect(
                authService.resetPassword(resetPasswordDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should generate a reset token and send a reset password email', async () => {
            const user = generateFakeUser();
            user.isEmailVerified = true;
            const resetPasswordDto = { email: user.email };
            usersService.findUserByEmail.mockResolvedValue(user);
            jwtUtils.generateToken.mockReturnValue('resetPasswordToken');

            await authService.resetPassword(resetPasswordDto);

            expect(jwtUtils.generateToken).toHaveBeenCalledWith(
                { sub: user.id },
                'resetPassword'
            );
            const expectedLink =
                'http://frontend/' + 'auth/reset-password/' + 'resetPasswordToken';
            expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
                user.email,
                expectedLink,
                `${user.firstName}${!user.lastName ? '' : user.lastName}`
            );
        });
    });

    describe('confirmNewPassword', () => {
        it('should update user password and delete all refresh token nonces', async () => {
            const userId = 1;
            const newPasswordDto = { newPassword: 'NewPassword123!$' };
            usersService.resetUserPassword.mockResolvedValue(generateFakeUser());
            refreshTokenNonceService.deleteRefreshTokenNonceByUserId.mockResolvedValue();

            const result = await authService.confirmNewPassword(newPasswordDto, userId);

            expect(usersService.resetUserPassword).toHaveBeenCalledWith(
                userId,
                newPasswordDto.newPassword
            );
            expect(
                refreshTokenNonceService.deleteRefreshTokenNonceByUserId
            ).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                message: 'Password has been reset successfully',
            });
        });
    });

    describe('confirmEmail', () => {
        it('should confirm the user email and return success message', async () => {
            const userId = 1;
            usersService.confirmUserEmail.mockResolvedValue(generateFakeUser());

            const result = await authService.confirmEmail(userId);

            expect(usersService.confirmUserEmail).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'Email confirmed successfully' });
        });
    });
});
