// src/config/storage.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

export default () => {
    const baseStoragePath = 'storage';

    return {
        storage: {
            basePath: baseStoragePath,
            paths: {
                tickets: process.env.STORAGE_TICKETS_PATH || path.join(baseStoragePath, 'tickets'),
            }
        },
    };
};
