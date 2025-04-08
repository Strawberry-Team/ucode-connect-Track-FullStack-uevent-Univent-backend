import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../db/database.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [EmailModule, DatabaseModule, UsersModule],
    controllers: [CompaniesController],
    providers: [CompaniesService, CompaniesRepository],
    exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
