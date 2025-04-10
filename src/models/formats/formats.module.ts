// src/models/formats/formats.module.ts
import { Module } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { FormatsController } from './formats.controller';
import { FormatsRepository } from './formats.repository';

@Module({
    providers: [FormatsService, FormatsRepository],
    controllers: [FormatsController],
})
export class FormatsModule {}
