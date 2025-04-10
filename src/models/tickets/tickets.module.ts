// src/models/events/constants/event.constants.ts
import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { DatabaseModule } from '../../db/database.module';
import { TicketsController } from './tickets.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [DatabaseModule, UsersModule],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, TicketsController],
    exports: [TicketsService],
})
export class TicketsModule {}
