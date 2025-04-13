import { Module } from '@nestjs/common';
import { EventThemesController } from './event-themes.controller';
import { EventThemesService } from './event-themes.service';
import { EventThemesRepository } from './event-themes.repository';
@Module({
  controllers: [EventThemesController],
  providers: [EventThemesService, EventThemesRepository],
  exports: [EventThemesService, EventThemesRepository],
})
export class EventThemesModule {}
