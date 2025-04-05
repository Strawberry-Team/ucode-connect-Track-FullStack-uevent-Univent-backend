// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entity/user.entity';
import { PasswordService } from './passwords.service';
import { OwnAccountGuard } from './guards/own-account.guard';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { GoogleOAuthService } from '../google/google-oauth.service';
import { GoogleModule } from '../google/google.module';

@Module({
    imports: [EmailModule, GoogleModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        PasswordService,
        OwnAccountGuard,
        GoogleOAuthService,
        EmailService,
    ],
    exports: [UsersService, UsersRepository, PasswordService],
})
export class UsersModule {}
