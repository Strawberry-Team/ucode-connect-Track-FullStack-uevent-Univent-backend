// src/config/scheduler.config.ts
import {Injectable} from '@nestjs/common';
import {CronExpression} from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

@Injectable()
export class SchedulerConfig {
    get unactivatedAccountNotification(): string {
        return CronExpression[validateEnv('SCHEDULER_UNACTIVATED_ACCOUNT_NOTIFICATION')];
    }

    get cleanRefreshTokensFromDb(): string {
        return CronExpression[validateEnv('SCHEDULER_CLEAN_REFRESH_TOKENS_FROM_DB_TIME')];
    }

}
