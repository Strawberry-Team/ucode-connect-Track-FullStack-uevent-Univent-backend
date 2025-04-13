// src/models/companies/companies.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Company } from './entities/company.entity';
import { DatabaseService } from '../../db/database.service';
import { CompanyIncludeOptions } from './interfaces/company-include-options.interface';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    private readonly DEFAULT_INCLUDE: CompanyIncludeOptions = {
        owner: false,
        events: false,
        news: false,
    };

    private async findUniqueCompany(
        where: Prisma.CompanyWhereUniqueInput,
        includeOptions: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company | null> {
        const include: Prisma.CompanyInclude = {
            owner: includeOptions.owner ?? false,
            events: includeOptions.events ?? false,
            news: includeOptions.events ?? false,
        };
        type CompanyWithIncludes = Prisma.CompanyGetPayload<{
            include: typeof include;
        }>;

        const company = await this.db.company.findUnique({
            where,
            include,
        });

        if (!company) {
            return null;
        }

        return company as CompanyWithIncludes as Company;
    }

    async create(
        data: Partial<Company>,
        include: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company> {
        return this.db.company.create({
            data: data as Prisma.CompanyCreateInput,
            include,
        });
    }

    async findAll(include: CompanyIncludeOptions = {}): Promise<Company[]> {
        return this.db.company.findMany({
            include,
        });
    }

    async findById(
        id: number,
        include: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company | null> {
        return this.findUniqueCompany({ id }, include);
    }

    async findByOwnerId(ownerId: number): Promise<Company | null> {
        return this.findUniqueCompany({ ownerId }, { owner: true });
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.findUniqueCompany({ email }, {});
    }

    async update(
        id: number,
        updateData: Partial<Company>,
        include: CompanyIncludeOptions = {},
    ): Promise<Company> {
        return this.db.company.update({
            where: { id },
            data: updateData as Prisma.CompanyUpdateInput,
            include,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
        });
    }
}
