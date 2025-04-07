import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository.service';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../db/database.module';

@Module({
    imports: [EmailModule, DatabaseModule],
    controllers: [CompaniesController],
    providers: [CompaniesService, CompaniesRepository],
    exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
