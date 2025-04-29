// src/config/storage.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.development' });

export default () => {
    const baseStoragePath = 'storage';

    return {
        storage: {
            basePath: baseStoragePath,
            paths: {
                tickets: path.join(baseStoragePath, 'tickets'),
            }
        },
    };
};
