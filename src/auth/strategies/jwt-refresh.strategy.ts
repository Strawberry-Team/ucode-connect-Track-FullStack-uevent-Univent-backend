// src/auth/strategies/jwt-refresh.strategy.ts
import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';
import { JwtUtils } from '../../jwt/jwt-token.utils';

const refreshTokenExtractor = (req: any): string | null => {
    const token = req?.body?.refreshToken;
    if (!token) {
        throw new InvalidRefreshTokenException('Refresh token is missing');
    }
    return token;
};

const refreshValidateFn = (payload: any) => {
    return {
        userId: payload.sub,
        nonce: payload.nonce,
        expiresIn: payload.exp,
        createdAt: payload.iat,
    };
};

export const JwtRefreshStrategy = createJwtStrategy({
    strategyName: 'jwt-refresh',
    tokenType: 'refresh',
    extractor: refreshTokenExtractor,
    validateFn: refreshValidateFn,
    handleError: (error) => {
        throw new InvalidRefreshTokenException('Invalid or expired refresh token');
    }
});
