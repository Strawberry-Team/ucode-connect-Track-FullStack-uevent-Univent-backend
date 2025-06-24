// src/config/database.app.config.ts
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

import { validateEnv } from '../common/utils/env.utils';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
const myEnv = dotenv.config({ path: envFile });
dotenvExpand.expand(myEnv);

export default () => ({
    database: {
        host: validateEnv('DB_APP_HOST'),
        port: parseInt(validateEnv('DB_APP_PORT'), 10),
        username: validateEnv('DB_APP_USER'),
        password: validateEnv('DB_APP_PASSWORD'),
        name: validateEnv('DB_APP_DATABASE'),
        connectionLimit: 10,
        url: validateEnv('DB_APP_URL'),
    },
});
