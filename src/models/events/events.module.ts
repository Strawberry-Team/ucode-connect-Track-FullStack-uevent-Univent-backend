// src/models/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import { EventThemesModule } from './themes/event-themes.module';
import { EventFormatsModule } from './formats/event-formats.module';

@Module({
    imports: [DatabaseModule, UsersModule, EventThemesModule, EventFormatsModule],
    providers: [EventsService, EventsRepository],
    controllers: [EventsController],
    exports: [EventsService, EventsRepository],
})
export class EventsModule {}
