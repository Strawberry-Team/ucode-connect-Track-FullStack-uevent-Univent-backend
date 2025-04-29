// src/config/google.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import appConfig from './app.config';

dotenv.config({ path: '.env.development' });

export default () => {
    const appConfiguration = appConfig();

    return {
        google: {
            clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
            clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
            gmailApi: {
                user: String(validateEnv('GOOGLE_GMAIL_USER')),
                refreshToken: String(
                    validateEnv('GOOGLE_GMAIL_API_REFRESH_TOKEN'),
                ),
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
