// src/models/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import {TicketsModule} from "../tickets/tickets.module";

@Module({
    imports: [DatabaseModule, UsersModule, TicketsModule],
    providers: [EventsService, EventsRepository],
    controllers: [EventsController],
    exports: [EventsService, EventsRepository],
})
export class EventsModule {}
