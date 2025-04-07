import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { DatabaseService } from 'src/db/database.service';

@Module({
    imports: [DatabaseService],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository],
    exports: [TicketsService],})
export class TicketsModule {}
