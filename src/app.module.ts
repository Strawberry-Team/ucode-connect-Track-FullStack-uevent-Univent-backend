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
import { FormatsModule } from './models/events/formats/formats.module';
import { ThemesModule } from './models/events/themes/themes.module';

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
        FormatsModule,
        TicketsModule,
        ThemesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
