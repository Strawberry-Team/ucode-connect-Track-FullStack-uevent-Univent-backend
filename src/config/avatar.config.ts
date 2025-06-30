// src/config/avatar.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import { Injectable } from '@nestjs/common';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

@Injectable()
export class AvatarConfig {
    get allowedTypes(): string {
        return 'jpg|jpeg|png';
    }

    get allowedTypesForInterceptor(): RegExp {
        return this.createRegExp(this.allowedTypes);
    }

    private createRegExp(types: string): RegExp {
        return new RegExp(`(${types})$`, 'i');
    }
}
