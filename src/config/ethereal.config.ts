// src/config/ethereal.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import appConfig from './app.config';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

export default () => {
    const appConfiguration = appConfig();

    return {
        ethereal: {
            host: 'smtp.ethereal.email',
            port: '587',
            user: String(validateEnv('ETHEREAL_USER')),
            password: String(validateEnv('ETHEREAL_PASS')),
        },
    };
};
