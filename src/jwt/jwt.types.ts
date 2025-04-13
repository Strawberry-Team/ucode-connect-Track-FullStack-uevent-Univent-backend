// src/jwt/jwt.types.ts
export type TokenType =
    | 'access'
    | 'refresh'
    | 'confirmEmail'
    | 'resetPassword'
export type JwtContext = 'auth' | 'calendar' | 'event';

export const TOKEN_CONTEXT_MAP: Record<TokenType, JwtContext> = {
    access: 'auth',
    refresh: 'auth',
    confirmEmail: 'auth',
    resetPassword: 'auth',
};

export interface JwtPayload {
    sub: number;
    nonce?: string;
    calendarId?: number;
    eventParticipationId?: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
}
