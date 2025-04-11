// src/models/events/events.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import { EventThemesModule } from './themes/event-themes.module';
import { EventFormatsModule } from './formats/event-formats.module';
import { NewsModule } from '../news/news.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => EventThemesModule),
        forwardRef(() => EventFormatsModule),
        forwardRef(() => UsersModule),
        forwardRef(() => NewsModule),
        forwardRef(() => CompaniesModule),
    ],
    providers: [EventsService, EventsRepository],
    controllers: [EventsController],
    exports: [EventsService, EventsRepository],
})
export class EventsModule {}
