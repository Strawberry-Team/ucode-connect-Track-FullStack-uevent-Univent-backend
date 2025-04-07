import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../db/database.module';

@Module({
    imports: [EmailModule, DatabaseModule],
    controllers: [CompanyController],
    providers: [CompanyService, CompanyRepository],
    exports: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
