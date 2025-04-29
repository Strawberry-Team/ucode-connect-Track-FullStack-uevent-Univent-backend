// src/config/app.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config({ path: '.env.development' });

export default () => {
    const frontendProtocol = String(validateEnv('APP_FRONTEND_PROTOCOL'));
    const frontendHost = String(validateEnv('APP_FRONTEND_HOST'));
    const frontendPort = parseInt(String(validateEnv('APP_FRONTEND_PORT')), 10);

    return {
        app: {
            name: String(validateEnv('APP_NAME')),
            supportEmail: String(validateEnv('APP_SUPPORT_EMAIL')),
            port: parseInt(String(validateEnv('APP_PORT')), 10),
            host: String(validateEnv('APP_HOST')),
            globalPrefix: String(validateEnv('APP_GLOBAL_PREFIX')),
            protocol: String(validateEnv('APP_PROTOCOL')),
            passwordSaltRounds: parseInt(
                String(validateEnv('APP_PASSWORD_BCRYPT_SALT_ROUNDS')),
            ),
            promoCodeSaltRounds: 10,
            frontendProtocol,
            frontendHost,
            frontendPort,
            frontendLink: `${frontendProtocol}://${frontendHost}:${frontendPort}/`,
            nodeEnv: String(validateEnv('APP_NODE_ENV')),
            logo: {
                path: String(validateEnv('APP_LOGO_PATH')),
                filename: Number(validateEnv('APP_THEME_ID')) == 1 ? "1-logo.png" : "2-logo.png",
            },
            cors: {
                methods: String(validateEnv('APP_CORS_METHODS')).split(','),
                allowedHeaders: String(
                    validateEnv('APP_CORS_ALLOWED_HEADERS'),
                ).split(','),
                credentials: Boolean(validateEnv('APP_CORS_CREDENTIALS')),
            },
            csrf: {
                cookie: {
                    key: String(validateEnv('APP_CSRF_COOKIE_KEY')),
                    httpOnly: Boolean(validateEnv('APP_CSRF_COOKIE_HTTP_ONLY')),
                    sameSite: String(validateEnv('APP_CSRF_COOKIE_SAME_SITE')),
                },
                ignoreMethods: String(
                    validateEnv('APP_CSRF_IGNORE_METHODS'),
                ).split(','),
            },
            theme:{
                id: Number(validateEnv('APP_THEME_ID')),
            }
        },
    };
};
