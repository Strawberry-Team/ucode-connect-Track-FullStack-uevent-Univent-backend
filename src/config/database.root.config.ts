// src/config/database.root.config.ts
import * as dotenv from 'dotenv';

dotenv.config();

import {validateEnv} from '../common/utils/env.utils';

export interface DatabaseRootConfig {
    host: string;
    user: string;
    password: string;
    port: number;
}

export const rootConfig: DatabaseRootConfig = {
    host: validateEnv('DB_ROOT_HOST'),
    user: validateEnv('DB_ROOT_USER'),
    password: validateEnv('DB_ROOT_PASSWORD'),
    port: Number(validateEnv('DB_ROOT_PORT')),
};