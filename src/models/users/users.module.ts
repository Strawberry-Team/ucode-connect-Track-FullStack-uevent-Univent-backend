// src/models/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PasswordService } from './passwords.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { EmailModule } from '../../email/email.module';
import { EmailService } from '../../email/email.service';
import { GoogleOAuthService } from '../../google/google-oauth.service';
import { GoogleModule } from '../../google/google.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompaniesService } from '../companies/companies.service';
import { DatabaseModule } from '../../db/database.module';

@Module({
    imports: [DatabaseModule, EmailModule, GoogleModule, forwardRef(() => CompaniesModule)],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        PasswordService,
        AccountOwnerGuard,
        GoogleOAuthService,
        EmailService,
        CompaniesService,
    ],
    exports: [UsersService, UsersRepository, PasswordService],
})
export class UsersModule {}
