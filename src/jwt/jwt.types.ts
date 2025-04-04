// src/jwt/jwt.types.ts
export type TokenType =
    'access'
    | 'refresh'
    | 'confirmEmail'
    | 'resetPassword'
    | 'confirmCalendar'
    | 'confirmArrangement';
export type JwtContext = 'auth' | 'calendar' | 'event';

export const TOKEN_CONTEXT_MAP: Record<TokenType, JwtContext> = {
    access: 'auth',
    refresh: 'auth',
    confirmEmail: 'auth',
    resetPassword: 'auth',
    confirmCalendar: 'calendar',
    confirmArrangement: 'event',
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