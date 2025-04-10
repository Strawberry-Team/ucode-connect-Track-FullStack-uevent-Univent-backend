// src/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { UserNotificationSchedulerService } from './user-notification-scheduler.service';
import { JwtCleanSchedulerService } from './jwt-clean-scheduler.service';
import { RefreshTokenNoncesModule } from 'src/models/refresh-token-nonces/refresh-token-nonces.module';
import { UsersModule } from 'src/models/users/users.module';
import { SchedulerConfig } from 'src/config/scheduler.config';

@Module({
    imports: [RefreshTokenNoncesModule, UsersModule],
    providers: [
        UserNotificationSchedulerService,
        JwtCleanSchedulerService,
        SchedulerConfig,
    ],
})
export class JobsModule {}
