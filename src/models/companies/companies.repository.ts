// src/models/companies/companies.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Company } from './entities/company.entity';
import { DatabaseService } from '../../db/database.service';
import { CompanyIncludeOptions } from './interfaces/company-include-options.interface';
import { GetCompaniesDto } from './dto/get-companies.dto';

type CompanyAggregateResult = {
    items: Company[];
    count: number;
    total: number;
};

type CompanyWithIncludes<T extends Prisma.CompanyInclude> = Prisma.CompanyGetPayload<{
    include: T;
}>;

const DEFAULT_COMPANY_ORDERING = {
    title: 'asc' as const,
} satisfies Prisma.CompanyOrderByWithRelationInput;

@Injectable()
export class CompaniesRepository {
    constructor(private readonly db: DatabaseService) {}

    private readonly DEFAULT_INCLUDE: CompanyIncludeOptions = {
        owner: false,
        events: false,
        news: false,
    } as const;

    private buildIncludeObject(options: CompanyIncludeOptions = this.DEFAULT_INCLUDE): Prisma.CompanyInclude {
        return {
            owner: options.owner ?? false,
            events: options.events ?? false,
            news: options.news ?? false,
        };
    }

    private buildWhereClause(query?: GetCompaniesDto): Prisma.CompanyWhereInput {
        const { email, title, description } = query || {};
        
        return {
            ...(email && { email: { contains: email } }),
            ...(title && { title: { contains: title } }),
            ...(description && { description: { contains: description } }),
        };
    }

    private async findUniqueCompany(
        where: Prisma.CompanyWhereUniqueInput,
        includeOptions: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company | null> {
        const include = this.buildIncludeObject(includeOptions);

        const company = await this.db.company.findUnique({
            where,
            include,
        });

        if (!company) {
            return null;
        }

        return company as CompanyWithIncludes<typeof include>;
    }

    private async executeCompanyQuery(
        where: Prisma.CompanyWhereInput,
        include: Prisma.CompanyInclude,
        skip?: number,
        take?: number
    ): Promise<CompanyAggregateResult> {
        const [items, total] = await Promise.all([
            this.db.company.findMany({
                where,
                include,
                orderBy: DEFAULT_COMPANY_ORDERING,
                skip,
                take,
            }),
            this.db.company.count({ where })
        ]);

        return {
            items: items as Company[],
            count: items.length,
            total,
        };
    }

    async create(
        data: Partial<Company>,
        includeOptions: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company> {
        const include = this.buildIncludeObject(includeOptions);
        
        return this.db.company.create({
            data: data as Prisma.CompanyCreateInput,
            include,
        }) as Promise<Company>;
    }

    async findAll(
        query?: GetCompaniesDto,
        includeOptions: CompanyIncludeOptions = {}
    ): Promise<CompanyAggregateResult> {
        const { skip, take } = query || {};
        const where = this.buildWhereClause(query);
        const include = this.buildIncludeObject(includeOptions);

        return this.executeCompanyQuery(where, include, skip, take);
    }

    async findById(
        id: number,
        includeOptions: CompanyIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<Company | null> {
        return this.findUniqueCompany({ id }, includeOptions);
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
        includeOptions: CompanyIncludeOptions = {},
    ): Promise<Company> {
        const include = this.buildIncludeObject(includeOptions);
        
        return this.db.company.update({
            where: { id },
            data: updateData as Prisma.CompanyUpdateInput,
            include,
        }) as Promise<Company>;
    }

    async delete(id: number): Promise<void> {
        await this.db.company.delete({
            where: { id },
        });
    }
}
