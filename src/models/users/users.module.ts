// src/models/users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HashingPasswordsService } from './hashing-passwords.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { EmailModule } from '../../email/email.module';
import { EmailService } from '../../email/email.service';
import { GoogleOAuthService } from '../../google/google-oauth.service';
import { GoogleModule } from '../../google/google.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompaniesService } from '../companies/companies.service';
import { HashingService } from '../../common/services/hashing.service';
import {OrdersModule} from "../orders/orders.module";

@Module({
    imports: [EmailModule,
              GoogleModule,
              forwardRef(() => OrdersModule),
              forwardRef(() => CompaniesModule)],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        HashingPasswordsService,
        AccountOwnerGuard,
        GoogleOAuthService,
        EmailService,
        CompaniesService,
        HashingService,
    ],
    exports: [UsersService, UsersRepository, HashingPasswordsService],
})
export class UsersModule {}
