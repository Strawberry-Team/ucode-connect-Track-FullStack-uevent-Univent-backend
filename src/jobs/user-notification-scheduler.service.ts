// src/jobs/user-notification-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { User } from 'src/models/users/entities/user.entity';
import { UsersService } from 'src/models/users/users.service';
import { SchedulerConfig } from '../config/scheduler.config';

@Injectable()
export class UserNotificationSchedulerService {
    constructor(
        private readonly usersService: UsersService,
        private configService: ConfigService,
    ) {}

    @Cron(SchedulerConfig.prototype.unactivatedAccountNotification)
    async unactivatedAccountNotification() {
        const EXPIRATION_TIME = convertToSeconds(
            String(
                this.configService.get<string>(`jwt.expiresIn.confirmEmail`),
            ),
        );
        const users: User[] =
            await this.usersService.findAllUnactivatedUsers(EXPIRATION_TIME);

        if (users.length > 0) {
            await Promise.all(
                users.map((user) => this.usersService.deleteUser(user.id)),
            );
        } else {
        }
    }
}
