// src/models/companies/companies.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { SERIALIZATION_GROUPS, User } from '../users/entities/user.entity';
import { DatabaseService } from '../../db/database.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    private plainUser(companyOwner: User | undefined): User {
        if (companyOwner) {
            companyOwner = plainToInstance(User, companyOwner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });

            return companyOwner;
        }

        throw new NotFoundException(`Company owner not found`);
    }

    async create(data: Partial<Company>): Promise<Company> {
        const company = await this.db.company.create({
            data: data as any,
            include: { owner: true },
        });

        company.owner = this.plainUser(company.owner);

        return company;
    }

    async findAll(): Promise<Company[]> {
        const companies = await this.db.company.findMany({
            include: { owner: true },
        });

        companies.map((company: Company) => {
            company.owner = this.plainUser(company.owner);
        });

        return companies;
    }

    async findById(id: number): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where: { id },
            include: { owner: true },
        });

        if (company == null) {
            return null;
        }

        company.owner = this.plainUser(company.owner);

        return company;
    }

    async findByOwnerId(ownerId: number): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where: { ownerId },
            include: { owner: true },
        });

        if (company == null) {
            return null;
        }

        company.owner = this.plainUser(company.owner);

        return company;
    }

    async findByEmail(email: string): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where: { email },
            include: { owner: true },
        });

        if (company == null) {
            return null;
        }

        company.owner = this.plainUser(company.owner);

        return company;
    }

/*
    async findByTitle(title: string, ownerId: number): Promise<Company | null> {
        const company = await this.db.company.findUnique({
            where: { title, ownerId },
            include: { owner: true },
        });

        if (company == null) {
            return null;
        }

        company.owner = this.plainUser(company.owner);

        return company;
    }
*/

    async update(id: number, updateData: Partial<Company>): Promise<Company> {
        const company = await this.db.company.update({
            where: { id },
            data: updateData as any,
            include: { owner: true },
        });

        company.owner = this.plainUser(company.owner);

        return company;
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
            include: { owner: true },
        });
    }
}
