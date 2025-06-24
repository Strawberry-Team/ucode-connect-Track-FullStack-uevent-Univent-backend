// src/config/scheduler.config.ts
import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

@Injectable()
export class SchedulerConfig {
    get unactivatedAccountNotification(): string {
        return CronExpression.EVERY_30_MINUTES;
    }

    get cleanRefreshTokensFromDb(): string {
        return CronExpression.EVERY_DAY_AT_10AM;
    }
}
