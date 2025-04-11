// // src/models/companies/companies.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Company } from './entities/company.entity';
import { SERIALIZATION_GROUPS, User } from '../users/entities/user.entity';
import { DatabaseService } from '../../db/database.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    private plainUser(companyOwner: User | undefined | null): User {
        if (!companyOwner) {
            throw new NotFoundException('Company owner not found');
        }

        return plainToInstance(User, companyOwner, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    private transformCompany<T extends Company | Company[]>(company: T): T {
        const transformSingleCompany = (item: Company) => {
            item.owner = this.plainUser(item.owner);
            return item;
        };

        if (Array.isArray(company)) {
            return company.map(transformSingleCompany) as T;
        }

        return transformSingleCompany(company) as T;
    }

    private async findUniqueCompany(
        where: Prisma.CompanyWhereUniqueInput,
    ): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where,
            include: { owner: true },
        });

        if (!company) {
            return null;
        }

        return this.transformCompany(company);
    }

    async create(data: Partial<Company>): Promise<Company> {
        const company = await this.db.company.create({
            data: data as any,
            include: { owner: true },
        });

        return this.transformCompany(company);
    }

    async findAll(): Promise<Company[]> {
        const companies = await this.db.company.findMany({
            include: { owner: true },
        });

        return this.transformCompany(companies);
    }

    async findById(id: number): Promise<Company | null> {
        return this.findUniqueCompany({ id });
    }

    async findByOwnerId(ownerId: number): Promise<Company | null> {
        return this.findUniqueCompany({ ownerId });
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.findUniqueCompany({ email });
    }

    /*
    async findByTitle(title: string, ownerId: number): Promise<Company | null> {
        return this.findUniqueCompany({ title_ownerId: { title, ownerId } });
    }
    */

    async update(id: number, updateData: Partial<Company>): Promise<Company> {
        const company = await this.db.company.update({
            where: { id },
            data: updateData as any,
            include: { owner: true },
        });

        return this.transformCompany(company);
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
        });
    }
}
