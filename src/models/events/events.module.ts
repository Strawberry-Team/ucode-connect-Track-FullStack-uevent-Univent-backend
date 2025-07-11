// src/models/events/events.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { UsersModule } from '../users/users.module';
import { NewsModule } from '../news/news.module';
import { CompaniesModule } from '../companies/companies.module';
import { EventFormatsModule } from './formats/event-formats.module';
import { TicketsModule } from "../tickets/tickets.module";
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { EventAttendeesModule } from './event-attendees/event-attendees.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [
        forwardRef(() => EventFormatsModule),
        forwardRef(() => UsersModule),
        forwardRef(() => NewsModule),
        forwardRef(() => CompaniesModule),
        forwardRef(() => TicketsModule),
        forwardRef(() => PromoCodesModule),
        forwardRef(() => EventAttendeesModule),
        forwardRef(() => SubscriptionsModule),
    ],
    providers: [
        EventsService,
        EventsRepository
    ],
    controllers: [EventsController],
    exports: [EventsService, EventsRepository],
})
export class EventsModule {}
