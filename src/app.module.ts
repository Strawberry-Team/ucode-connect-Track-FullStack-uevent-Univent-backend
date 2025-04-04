// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module'
import databaseConfig from './config/database.app.config';
import jwtConfig from './config/jwt.config';
import appConfig from "./config/app.config";
import { RefreshTokenNonceModule } from './refresh-token-nonce/refresh-token-nonce.module';
import { JwtConfigModule } from './jwt/jwt.module';
import { SchedulerTasksModule } from './scheduler-tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, appConfig, jwtConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.name'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true, // TODO: (not now) For production, disable this option
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtConfigModule,
        UsersModule,
        AuthModule,
        RefreshTokenNonceModule,
        SchedulerTasksModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
