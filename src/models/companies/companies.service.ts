// src/models/companies/companies.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesRepository } from './companies.repository';
import { Company, SERIALIZATION_GROUPS } from './entities/company.entity';
import { plainToInstance } from 'class-transformer';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { GetCompaniesDto } from './dto/get-companies.dto';

@Injectable()
export class CompaniesService {
    private readonly frontUrl: string;

    constructor(
        private readonly companyRepository: CompaniesRepository,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) {
        this.frontUrl = String(
            this.configService.get<string>('app.frontendLink'),
        );
    }

    async create(dto: CreateCompanyDto, userId: number) {
        let existingCompany =
            await this.companyRepository.findByOwnerId(userId);

        if (existingCompany) {
            throw new ConflictException('User already has a company');
        }

        existingCompany = await this.companyRepository.findByEmail(dto.email);

        if (existingCompany) {
            throw new ConflictException('Company email already in use');
        }

        const company = await this.companyRepository.create(
            {
                ...dto,
                ownerId: userId,
            },
            { owner: true },
        );

        if (!company.owner) {
            throw new NotFoundException('User not found');
        }

        this.emailService.sendWelcomeCompanyEmail(
            company.owner.email,
            `${company.owner.firstName} ${company.owner.lastName}`,
            company.title,
            this.frontUrl,
        );

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findAll(query?: GetCompaniesDto): 
    Promise<{ items: Company[]; count: number; total: number; }> {
        const companies = await this.companyRepository.findAll(query);

        companies.items = companies.items.map((company) =>
            plainToInstance(Company, company, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );

        return companies;
    }

    public async findById(id: number): Promise<Company> {
        const company = await this.companyRepository.findById(id);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByOwnerId(ownerId: number): Promise<Company> {
        const company = await this.companyRepository.findByOwnerId(ownerId);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByEmail(email: string): Promise<Company> {
        if (!email || email.length < 5 || !email.includes('@')) {
            throw new BadRequestException('Invalid company email');
        }

        const company = await this.companyRepository.findByEmail(email);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
        const existingCompany = await this.companyRepository.findById(id);

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        const company = await this.companyRepository.update(id, dto);

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateLogo(id: number, logoName: string): Promise<Company> {
        let existingCompany = await this.companyRepository.findById(id);

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        const company = await this.companyRepository.update(id, { logoName });

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async delete(id: number): Promise<{ message: string }> {
        let existingCompany = await this.companyRepository.findById(id, {
            events: true,
        });

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        if (existingCompany.events?.length !== 0) {
            throw new BadRequestException(
                `Unable to delete a company with existing events`,
            );
        }

        await this.companyRepository.delete(id);

        return { message: 'Company successfully deleted' };
    }
}
