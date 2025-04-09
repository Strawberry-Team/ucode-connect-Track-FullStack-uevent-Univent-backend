import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { DatabaseModule } from '../db/database.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [EventsService, EventsRepository],
  controllers: [EventsController],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}
