import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { SERIALIZATION_GROUPS, User } from '../users/entity/user.entity';
import { DatabaseService } from '../db/database.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(data: Partial<Company>): Promise<Company> {
        const company = await this.db.company.create({
            data: data as any,
            include: { owner: true },
        });

        if (company.owner) {
            company.owner = plainToInstance(User, company.owner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

        return company;
    }

    async findAll(): Promise<Company[]> {
        const companies = await this.db.company.findMany({ include: { owner: true } });

        companies.map((company: Company) => {
            if (company.owner) {
                company.owner = plainToInstance(User, company.owner, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                });
            }
        })

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

        if (company.owner) {
            company.owner = plainToInstance(User, company.owner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

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

        if (company.owner) {
            company.owner = plainToInstance(User, company.owner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

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

        if (company.owner) {
            company.owner = plainToInstance(User, company.owner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

        return company;
    }


    async findUserByOwnerId(ownerId: number): Promise<User | null> {
        let user = await this.db.user.findUnique({
            where: { id: ownerId },
        });

        if (user) {
            user = plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

        return user;
    }

    async update(id: number, updateData: Partial<Company>): Promise<Company> {
        const company = await this.db.company.update({
            where: { id },
            data: updateData as any,
            include: { owner: true },
        });

        if (company.owner) {
            company.owner = plainToInstance(User, company.owner, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
        }

        return company;
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
            include: { owner: true },
        });
    }
}
