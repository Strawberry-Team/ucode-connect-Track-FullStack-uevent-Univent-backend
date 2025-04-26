// src/models/events/constants/event.constants.ts
import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { TicketsController } from './tickets.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from "../companies/companies.module";
import {EventsModule} from "../events/events.module";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => CompaniesModule),
        forwardRef(() => EventsModule),
    ],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, TicketsController],
    exports: [TicketsService, TicketsRepository],
})
export class TicketsModule {}
