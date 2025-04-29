// src/config/jwt.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config({ path: '.env.development' });

export default () => ({
    jwt: {
        secrets: {
            access: validateEnv('JWT_ACCESS_SECRET'),
            refresh: validateEnv('JWT_REFRESH_SECRET'),
            confirmEmail: validateEnv('JWT_CONFIRM_EMAIL_SECRET'),
            resetPassword: validateEnv('JWT_RESET_PASSWORD_SECRET'),
        },
        expiresIn: {
            access: '15m',
            refresh: '7d',
            confirmEmail: '24h',
            resetPassword: '1h',
        },
        issuer: {
            auth: '/api/auth',
        },
        audience: {
            auth: '/api',
        },
        algorithm: 'HS256',
    },
});
