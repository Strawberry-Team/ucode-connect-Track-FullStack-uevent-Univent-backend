// src/models/auth/guards/auth.jwt-guards.ts
import { AuthGuard } from '@nestjs/passport';
import { createJwtGuard } from '../../../jwt/jwt-guard.factory';
import { RefreshTokenNoncesService } from '../../refresh-token-nonces/refresh-token-nonces.service';
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { UsersService } from '../../users/users.service';

export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');

@Injectable()
export class JwtAuthGuard
    extends AuthGuard('jwt-access')
    implements CanActivate
{
    constructor(
        private reflector: Reflector,
        private readonly usersService: UsersService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const result = await super.canActivate(context);
        if (!result) return false;

        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user || !user.userId) {
            throw new UnauthorizedException('Invalid token payload');
        }

        const userExists = await this.usersService.findUserByIdWithoutPassword(
            user.userId,
        );
        if (!userExists) {
            throw new UnauthorizedException('User not found');
        }

        return true;
    }
}

@Injectable()
export class JwtRefreshGuard
    extends AuthGuard('jwt-refresh')
    implements CanActivate
{
    constructor(
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const canActivate = await super.canActivate(context);
            if (!canActivate) return false;

            const request = context.switchToHttp().getRequest();

            const { user } = request;
            if (!user || !user.nonce) {
                throw new BadRequestException(
                    'Refresh token does not contain nonce',
                );
            }

            const nonceRecord =
                await this.refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId(
                    user.userId,
                    user.nonce,
                );
            if (!nonceRecord) {
                throw new BadRequestException(
                    'Invalid or expired refresh token',
                );
            }

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new BadRequestException(
                    'Invalid or expired refresh token',
                );
            }
            throw error;
        }
    }
}
