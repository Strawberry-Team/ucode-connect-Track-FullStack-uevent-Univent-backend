// src/config/jwt.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

export default () => ({
    jwt: {
        secrets: {
            access: validateEnv('JWT_ACCESS_SECRET'),
            refresh: validateEnv('JWT_REFRESH_SECRET'),
            confirmEmail: validateEnv('JWT_CONFIRM_EMAIL_SECRET'),
            resetPassword: validateEnv('JWT_RESET_PASSWORD_SECRET'),
        },
        expiresIn: {
            access: '1d',
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
