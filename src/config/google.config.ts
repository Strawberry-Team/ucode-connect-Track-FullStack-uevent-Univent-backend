// src/config/google.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import appConfig from './app.config';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

/**
 * Google configuration including Gmail API settings.
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: Google OAuth2 client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth2 client secret
 * - GOOGLE_CALLBACK_URL: OAuth2 callback URL
 * - GMAIL_USER: Gmail address used for sending emails
 * - GMAIL_REFRESH_TOKEN: OAuth2 refresh token for Gmail API
 * GMAIL_ACCESS_TOKEN will be refreshed automatically
 */
export default () => {
    const appConfiguration = appConfig();

    return {
        google: {
            clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
            clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
            gmailApi: {
                user: String(validateEnv('GOOGLE_GMAIL_USER')),
                clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
                clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
                refreshToken: String(validateEnv('GOOGLE_GMAIL_API_REFRESH_TOKEN')),
            },
            redirectUri: appConfiguration.app.frontendLink,
            playgroundRedirectUri: 'http://localhost:8080/api/auth/google/playground',
        },
        ethereal: {
            host: 'smtp.ethereal.email',
            port: '587',
            user: String(validateEnv('ETHEREAL_USER')),
            password: String(validateEnv('ETHEREAL_PASS')),
        },
    };
};
