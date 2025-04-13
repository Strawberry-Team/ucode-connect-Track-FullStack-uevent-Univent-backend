// scr/models/news/news.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { EventsModule } from '../events/events.module';
import { NewsRepository } from './news.repository';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => EventsModule),
        forwardRef(() => CompaniesModule),
    ],
    controllers: [NewsController],
    providers: [NewsService, NewsRepository],
    exports: [NewsService, NewsRepository],
})
export class NewsModule {}
