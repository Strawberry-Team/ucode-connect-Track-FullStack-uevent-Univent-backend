import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { User } from '../users/entity/user.entity';
import { DatabaseService } from '../db/database.service';

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(data: Partial<Company>): Promise<Company> {
        return this.db.company.create({
            data: data as any,
        });
    }

    async findAll(): Promise<Company[]> {
        return this.db.company.findMany();
    }

    async findById(id: number): Promise<Company | null> {
        return this.db.company.findUnique({
            where: { id },
            include: { owner: true },
        });
    }

    async findByOwnerId(ownerId: number): Promise<Company | null> {
        return this.db.company.findUnique({
            where: { ownerId },
            include: { owner: true },
        });
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.db.company.findUnique({
            where: { email },
            include: { owner: true },
        });
    }

    async findUserByOwnerId(ownerId: number): Promise<User | null> {
        return this.db.user.findUnique({
            where: { id: ownerId },
        });
    }

    async update(id: number, updateData: Partial<Company>): Promise<Company> {
        return this.db.company.update({
            where: { id },
            data: updateData as any,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
        });
    }
}
