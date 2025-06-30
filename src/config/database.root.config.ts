// src/config/database.root.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

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
