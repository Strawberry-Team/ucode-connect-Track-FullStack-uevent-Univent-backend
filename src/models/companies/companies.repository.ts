// // src/models/companies/companies.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Company } from './entities/company.entity';
import { DatabaseService } from '../../db/database.service';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    private async findUniqueCompany(
        where: Prisma.CompanyWhereUniqueInput,
        includeOwner: boolean = false,
        includeEvents: boolean = false,
        includeNews: boolean = false,
    ): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where,
            include: {
                owner: includeOwner,
                events: includeEvents,
                news: includeNews,
            },
        });

        if (!company) {
            return null;
        }

        return company as Company;
    }

    async create(data: Partial<Company>): Promise<Company> {
        return this.db.company.create({
            data: data as any,
            include: { owner: false, events: false, news: false },
        });
    }

    async findAll(): Promise<Company[]> {
        return this.db.company.findMany({
            include: { owner: false, events: false, news: false },
        });
    }

    async findById(id: number): Promise<Company | null> {
        return this.findUniqueCompany({ id });
    }

    async findByOwnerId(ownerId: number): Promise<Company | null> {
        return this.findUniqueCompany({ ownerId }, true);
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.findUniqueCompany({ email });
    }

    async update(id: number, updateData: Partial<Company>): Promise<Company> {
        return this.db.company.update({
            where: { id },
            data: updateData as any,
            include: { owner: false, events: false, news: false },
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
        });
    }
}
