// src/config/database.test.config.ts
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as fs from 'fs';
import * as path from 'path';
import { validateEnv } from '../common/utils/env.utils';

const envPath = path.resolve(process.cwd(), '.env');
const testEnvPath = path.resolve(process.cwd(), '.env.test');
let testEnvExists = false;

try {
    const mainEnv = dotenv.config({ path: envPath });
    dotenvExpand.expand(mainEnv);

    if (fs.existsSync(testEnvPath)) {
        const testEnv = dotenv.config({
            path: testEnvPath,
            override: true,
        });
        dotenvExpand.expand(testEnv);
        testEnvExists = true;
    }
} catch (error) {
    testEnvExists = false;
}

export default () => {
    return {
        database: {
            name: testEnvExists ? validateEnv('DB_APP_DATABASE') : null,
            url: testEnvExists ? validateEnv('DB_APP_URL') : null,
        },
    };
};
