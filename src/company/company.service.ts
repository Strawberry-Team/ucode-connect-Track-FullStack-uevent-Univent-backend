import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository } from './company.repository';
import { Company, SERIALIZATION_GROUPS } from './entities/company.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompanyService {
    constructor(
        private readonly companyRepository: CompanyRepository
    ) {}

    async createCompany(dto: CreateCompanyDto) {
        let company = plainToInstance(Company, dto, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });

        let existingCompany = await this.companyRepository.findByOwnerId(
            company.ownerId,
        );

        if (existingCompany) {
            throw new BadRequestException('User already has a company');
        }

        existingCompany = await this.companyRepository.findByEmail(
            company.email,
        );

        if (existingCompany) {
            throw new ConflictException('Company email already in use');
        }

        company = await this.companyRepository.create(company);

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findAllCompanies(): Promise<Company[]> {
        const companies = await this.companyRepository.findAll();

        if (!companies || companies.length === 0) {
            throw new NotFoundException(`Companies not found`);
        }

        return companies.map((company) =>
            plainToInstance(Company, company, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );
    }

    public async findCompanyById(id: number): Promise<Company> {
        if (!id || id < 0) {
            throw new NotFoundException(
                'Company ID must be greater than 0',
            );
        }

        const company = await this.companyRepository.findById(id);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findCompanyByOwnerId(ownerId: number): Promise<Company> {
        if (!ownerId || ownerId < 0) {
            throw new NotFoundException(
                'Company ownerId must be greater than 0',
            );
        }

        const company = await this.companyRepository.findByOwnerId(ownerId);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findCompanyByEmail(email: string): Promise<Company> {
        if (!email || email.length === 0) {
            throw new NotFoundException('Company email must be not empty');
        }

        const company = await this.companyRepository.findByEmail(email);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateCompany(id: number, dto: UpdateCompanyDto): Promise<Company> {
        let company = plainToInstance(Company, dto, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
        
        let existingCompany = await this.companyRepository.findById(id);

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        company = await this.companyRepository.update(id, company);

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateCompanyLogo(id: number, logo: string): Promise<Company> {
        let company = await this.companyRepository.findById(id);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }
        company.logoName = logo;
        company = await this.companyRepository.update(id, company);

        return plainToInstance(Company, company, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async removeCompany(id: number): Promise<void> {
        await this.companyRepository.delete(id);
    }
}
