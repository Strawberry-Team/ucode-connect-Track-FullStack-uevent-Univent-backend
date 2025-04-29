// src/config/scheduler.config.ts
import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config({ path: '.env.development' });

@Injectable()
export class SchedulerConfig {
    get unactivatedAccountNotification(): string {
        return CronExpression.EVERY_30_MINUTES;
    }

    get cleanRefreshTokensFromDb(): string {
        return CronExpression.EVERY_DAY_AT_10AM;
    }
}
