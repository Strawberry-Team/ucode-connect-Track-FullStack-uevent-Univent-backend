// scr/models/news/news.module.ts
import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { EventsModule } from '../events/events.module';
import { NewsRepository } from './news.repository';

@Module({
    imports: [DatabaseModule, UsersModule, CompaniesModule, EventsModule],
    controllers: [NewsController],
    providers: [NewsService, NewsRepository],
    exports: [NewsService, NewsRepository],
})
export class NewsModule {}
