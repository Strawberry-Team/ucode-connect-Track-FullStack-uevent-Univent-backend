// scr/models/companies/companies.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { EmailModule } from '../../email/email.module';
import { UsersModule } from '../users/users.module';
import { NewsModule } from '../news/news.module';
import { EventsModule } from '../events/events.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        EmailModule,
        forwardRef(() => NewsModule),
        forwardRef(() => EventsModule),
        forwardRef(() => SubscriptionsModule),
    ],
    controllers: [CompaniesController],
    providers: [CompaniesService, CompaniesRepository],
    exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
