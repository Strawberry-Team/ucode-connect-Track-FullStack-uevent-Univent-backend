// src/models/auth/auth.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateRefreshTokenNonceDto } from '../refresh-token-nonces/dto/create-refresh-nonce.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { UsersService } from 'src/models/users/users.service';
import { RefreshTokenNoncesService } from 'src/models/refresh-token-nonces/refresh-token-nonces.service';
import { JwtUtils } from '../../jwt/jwt-token.utils';
import { PasswordService } from '../users/passwords.service';
import { convertToSeconds } from '../../common/utils/time.utils';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { NonceUtils } from 'src/common/utils/nonce.utils';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    private frontUrl: string;

    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
        private readonly jwtUtils: JwtUtils,
        private readonly passwordService: PasswordService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly nonceUtils: NonceUtils,
    ) {
        this.frontUrl = String(
            this.configService.get<string>('app.frontendLink'),
        );
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);
        this.sendConfirmationEmail(user);
        return { user: user };
    }

    private async sendConfirmationEmail(user: User) {
        const result = this.jwtUtils.generateToken(
            { sub: user.id },
            'confirmEmail',
        );
        const link = this.frontUrl + 'auth/confirm-email/' + result;
        this.emailService.sendConfirmationEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );
    }

    async confirmEmail(userId: number) {
        await this.usersService.confirmUserEmail(userId);
        return { message: 'Email confirmed successfully' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findUserByEmail(loginDto.email);

        const passwordValid = await this.passwordService.compare(
            loginDto.password,
            String(user.password),
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!user.isEmailVerified) {
            throw new ForbiddenException('User email is unverified');
        }

        const newNonce = this.nonceUtils.generateNonce();

        const accessToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'access',
        );
        const refreshToken = this.jwtUtils.generateToken(
            { sub: user.id, nonce: newNonce },
            'refresh',
        );

        await this.refreshTokenNonceService.createRefreshTokenNonce({
            userId: user.id,
            nonce: newNonce,
        } as CreateRefreshTokenNonceDto);

        const {
            password,
            isEmailVerified,
            refreshTokenNonces,
            ...userWithoutSensitiveInfo
        } = user;
        return { user: userWithoutSensitiveInfo, accessToken, refreshToken };
    }

    async refreshAccessToken(
        userId: number,
        createdAt: number,
        refreshNonce: string,
    ) {
        const accessToken = this.jwtUtils.generateToken(
            { sub: userId },
            'access',
        );
        const time: number = new Date().getTime() / 1000;

        if (time - createdAt > convertToSeconds('1d')) {
            const newNonce = this.nonceUtils.generateNonce();
            const newRefreshToken = this.jwtUtils.generateToken(
                { sub: userId, nonce: newNonce },
                'refresh',
            );

            await this.refreshTokenNonceService.createRefreshTokenNonce({
                userId: userId,
                nonce: newNonce,
            } as CreateRefreshTokenNonceDto);

            const nonceId: number = await this.refreshTokenNonceService
                .findRefreshTokenNonceByNonceAndUserId(userId, refreshNonce)
                .then((nonce) => nonce.id);
            await this.refreshTokenNonceService.deleteRefreshTokenNonceById(
                nonceId,
            );
            return { accessToken, newRefreshToken };
        }

        return { accessToken };
    }

    async logout(userId: number, refreshNonceDto: string) {
        const nonceEntity =
            await this.refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId(
                userId,
                refreshNonceDto,
            );
        if (!nonceEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        await this.refreshTokenNonceService.deleteRefreshTokenNonceById(
            nonceEntity.id,
        );
        return { message: 'Logged out successfully' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findUserByEmail(
            resetPasswordDto.email,
        );

        if (!user || !user.isEmailVerified) {
            throw new NotFoundException(
                'User with this email not found or you need verify your email',
            );
        }

        const passwordResetToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'resetPassword',
        );

        const link =
            this.frontUrl + 'auth/reset-password/' + passwordResetToken;

        this.emailService.sendResetPasswordEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );

        return { message: 'Password recovery email sent' };
    }

    async confirmNewPassword(newPasswordDto: NewPasswordDto, userId: number) {
        await this.usersService.resetUserPassword(
            userId,
            newPasswordDto.newPassword,
        );
        await this.refreshTokenNonceService.deleteRefreshTokenNonceByUserId(
            userId,
        );
        return { message: 'Password has been reset successfully' };
    }
}
