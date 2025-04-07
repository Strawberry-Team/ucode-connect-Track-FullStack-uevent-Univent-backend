// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.app.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { RefreshTokenNonceModule } from './refresh-token-nonces/refresh-token-nonce.module';
import { JwtConfigModule } from './jwt/jwt.module';
import { SchedulerTasksModule } from './scheduler-tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './db/database.module';
import { CompanyModule } from './company/company.module';

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
        RefreshTokenNonceModule,
        SchedulerTasksModule,
        CompanyModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
