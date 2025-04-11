import { Module } from '@nestjs/common';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { EventThemesRepository } from './themes.repository';
@Module({
  controllers: [ThemesController],
  providers: [ThemesService, EventThemesRepository],
  exports: [ThemesService, EventThemesRepository],
})
export class ThemesModule {}
