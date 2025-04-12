// src/models/formats/formats.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { FormatsController } from './formats.controller';
import { FormatsRepository } from './formats.repository';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [forwardRef(() => EventsModule)],
    providers: [FormatsService, FormatsRepository],
    controllers: [FormatsController],
})
export class FormatsModule {}
