// src/models/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import { ThemesModule } from './themes/themes.module';
import { FormatsModule } from './formats/formats.module';

@Module({
    imports: [DatabaseModule, UsersModule, ThemesModule, FormatsModule],
    providers: [EventsService, EventsRepository],
    controllers: [EventsController],
    exports: [EventsService, EventsRepository],
})
export class EventsModule {}
