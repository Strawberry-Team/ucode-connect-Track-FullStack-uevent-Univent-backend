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
            access: validateEnv('JWT_ACCESS_EXPIRES_IN'),
            refresh: validateEnv('JWT_REFRESH_EXPIRES_IN'),
            confirmEmail: validateEnv('JWT_CONFIRM_EMAIL_EXPIRES_IN'),
            resetPassword: validateEnv('JWT_RESET_PASSWORD_EXPIRES_IN'),
        },
        issuer: {
            auth: validateEnv('JWT_ISSUER'),
        },
        audience: {
            auth: validateEnv('JWT_AUDIENCE'),
        },
        algorithm: validateEnv('JWT_ALGORITHM'),
    },
});
