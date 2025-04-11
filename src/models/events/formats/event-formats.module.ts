// src/models/events/formats/formats.module.ts
import { Module } from '@nestjs/common';
import { EventFormatsService } from './event-formats.service';
import { EventFormatsController } from './event-formats.controller';
import { EventFormatsRepository } from './event-formats.repository';

@Module({
    providers: [EventFormatsService, EventFormatsRepository],
    controllers: [EventFormatsController],
    exports: [EventFormatsService, EventFormatsRepository],
})
export class EventFormatsModule {}
