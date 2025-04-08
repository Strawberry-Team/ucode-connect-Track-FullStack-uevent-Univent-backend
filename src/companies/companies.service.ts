import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesRepository } from './companies.repository';
import { Company } from './entities/company.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompaniesService {
    constructor(private readonly companyRepository: CompaniesRepository) {}

    async createCompany(dto: CreateCompanyDto) {
        if (!dto.ownerId || dto.ownerId < 0) {
            throw new BadRequestException(
                'Company ownerId must be greater than 0',
            );
        }
        const existingUser = await this.companyRepository.findUserByOwnerId(
            dto.ownerId,
        );

        if (!existingUser) {
            throw new NotFoundException(`Company owner not found`);
        }

        let existingCompany = await this.companyRepository.findByOwnerId(
            dto.ownerId,
        );

        if (existingCompany) {
            throw new ConflictException('User already has a company');
        }

        if (!dto.email || dto.email.length === 0) {
            throw new BadRequestException('Company email must be not empty');
        }

        existingCompany = await this.companyRepository.findByEmail(dto.email);

        if (existingCompany) {
            throw new ConflictException('Company email already in use');
        }

        const company = await this.companyRepository.create(dto);

        return plainToInstance(Company, company);
    }

    public async findAllCompanies(): Promise<Company[]> {
        const companies = await this.companyRepository.findAll();

        if (!companies || companies.length === 0) {
            throw new NotFoundException(`Companies not found`);
        }

        return companies.map((company) =>
            plainToInstance(Company, company),
        );
    }

    public async findCompanyById(id: number): Promise<Company> {
        if (!id || id < 0) {
            throw new BadRequestException('Company ID must be greater than 0');
        }

        const company = await this.companyRepository.findById(id);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company);
    }

    public async findCompanyByOwnerId(ownerId: number): Promise<Company> {
        if (!ownerId || ownerId < 0) {
            throw new BadRequestException(
                'Company ownerId must be greater than 0',
            );
        }

        const company = await this.companyRepository.findByOwnerId(ownerId);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company);

    }

    public async findCompanyByEmail(email: string): Promise<Company> {
        if (!email || email.length === 0) {
            throw new BadRequestException('Company email must be not empty');
        }

        const company = await this.companyRepository.findByEmail(email);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }

        return plainToInstance(Company, company);
    }

    async updateCompany(id: number, dto: UpdateCompanyDto): Promise<Company> {
        if (!id || id < 0) {
            throw new BadRequestException('Company Id must be greater than 0');
        }

        let existingCompany = await this.companyRepository.findById(id);

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        if (!dto.ownerId || dto.ownerId < 0) {
            throw new BadRequestException(
                'Company ownerId must be greater than 0',
            );
        }
        const existingUser = await this.companyRepository.findUserByOwnerId(
            dto.ownerId,
        );

        if (!existingUser) {
            throw new NotFoundException(`New Owner not found`);
        }

        existingCompany = await this.companyRepository.findByOwnerId(
            dto.ownerId,
        );

        if (existingCompany && existingCompany.id != id) {
            throw new ConflictException('User already has a company');
        }

        if (!dto.email || dto.email.length === 0) {
            throw new BadRequestException('Company email must be not empty');
        }

        existingCompany = await this.companyRepository.findByEmail(dto.email);

        if (existingCompany && existingCompany.id != id) {
            throw new ConflictException('Company email already in use');
        }

        const company = await this.companyRepository.update(id, dto);

        return plainToInstance(Company, company);
    }

    async updateCompanyLogo(id: number, logo: string): Promise<Company> {
        let company = await this.companyRepository.findById(id);

        if (!company) {
            throw new NotFoundException(`Company not found`);
        }
        company.logoName = logo;
        company = await this.companyRepository.update(id, company);

        return plainToInstance(Company, company);
    }

    async removeCompany(id: number): Promise<void> {
        if (!id || id < 0) {
            throw new BadRequestException('Company Id must be greater than 0');
        }

        let existingCompany = await this.companyRepository.findById(id);

        if (!existingCompany) {
            throw new NotFoundException(`Company not found`);
        }

        await this.companyRepository.delete(id);
    }
}
