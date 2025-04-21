// src/models/notifications/notifications.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsListener } from './notifications.listener';
import { DatabaseModule } from '../../db/database.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    forwardRef(() => DatabaseModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsListener
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
