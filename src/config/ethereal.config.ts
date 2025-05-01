// src/config/ethereal.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import appConfig from './app.config';

dotenv.config({ path: '.env.development' });

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
