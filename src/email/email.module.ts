// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import googleConfig from '../config/google.config';
import appConfig from '../config/app.config';
import { GoogleModule } from '../google/google.module';
import etherealConfig from '../config/ethereal.config';

@Module({
    imports: [
        ConfigModule.forFeature(googleConfig),
        ConfigModule.forFeature(appConfig),
        ConfigModule.forFeature(etherealConfig),
        GoogleModule,
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
