// src/models/subscriptions/subscriptions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { EventsModule } from '../events/events.module';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        forwardRef(() => EventsModule),
        forwardRef(() => CompaniesModule),
        forwardRef(() => UsersModule),
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, SubscriptionsRepository],
    exports: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
