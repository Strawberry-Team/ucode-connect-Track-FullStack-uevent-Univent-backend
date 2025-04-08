import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { DatabaseService } from 'src/db/database.service';
import {DatabaseModule} from "../db/database.module";

@Module({
    imports: [DatabaseModule],
    providers: [TicketsService, TicketsRepository],
    exports: [TicketsService],
})
export class TicketsModule {}

