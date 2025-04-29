// src/config/database.app.config.ts
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

import { validateEnv } from '../common/utils/env.utils';

const myEnv = dotenv.config({ path: '.env.development' });
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
