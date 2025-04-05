// src/scheduler-tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { UserNotificationSchedulerService } from './user/user.notification.scheduler.service';
import { JwtCleanSchedulerService } from './jwt/jwt-clean-scheduler.service';
import { RefreshTokenNonceModule } from 'src/refresh-token-nonces/refresh-token-nonce.module';
import { UsersModule } from 'src/users/users.module';
import { SchedulerConfig } from 'src/config/scheduler.config';

@Module({
    imports: [RefreshTokenNonceModule, UsersModule],
    providers: [
        UserNotificationSchedulerService,
        JwtCleanSchedulerService,
        SchedulerConfig,
    ],
})
export class SchedulerTasksModule {}
