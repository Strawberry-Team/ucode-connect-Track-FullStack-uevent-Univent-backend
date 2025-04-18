// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './models/users/users.module';
import { AuthModule } from './models/auth/auth.module';
import databaseConfig from './config/database.app.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { RefreshTokenNoncesModule } from './models/refresh-token-nonces/refresh-token-nonces.module';
import { JwtConfigModule } from './jwt/jwt.module';
import { JobsModule } from './jobs/jobs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './db/database.module';
import { TicketsModule } from './models/tickets/tickets.module';
import { CompaniesModule } from './models/companies/companies.module';
import { EventsModule } from './models/events/events.module';
import { EventFormatsModule } from './models/events/formats/event-formats.module';
import { EventThemesModule } from './models/events/themes/event-themes.module';
import { NewsModule } from './models/news/news.module';
import { PromoCodesModule } from './models/promo-codes/promo-codes.module';
import { EventAttendeesModule } from './models/events/event-attendees/event-attendees.module';
import {OrdersModule} from "./models/orders/orders.module";
import { SubscriptionsModule } from './models/subscriptions/subscriptions.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, appConfig, jwtConfig],
        }),
        DatabaseModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtConfigModule,
        UsersModule,
        AuthModule,
        RefreshTokenNoncesModule,
        JobsModule,
        CompaniesModule,
        EventsModule,
        EventFormatsModule,
        EventThemesModule,
        TicketsModule,
        NewsModule,
        OrdersModule,
        PromoCodesModule,
        EventAttendeesModule,
        SubscriptionsModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
