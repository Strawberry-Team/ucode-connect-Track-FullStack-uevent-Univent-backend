// src/models/news/news.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { News } from './entities/news.entity';
import { DatabaseService } from '../../db/database.service';
import { NewsIncludeOptions } from './interfaces/news-include-options.interface';

type BaseNewsInclude = {
    author?: boolean;
    company?: boolean;
    event?: boolean;
};

const DEFAULT_ORDERING = {
    createdAt: 'desc' as const,
} satisfies Prisma.NewsOrderByWithRelationInput;

@Injectable()
export class NewsRepository {
    private readonly DEFAULT_INCLUDE = {
        author: false,
        company: false,
        event: false,
    } as const satisfies BaseNewsInclude;

    constructor(private readonly db: DatabaseService) {}

    private buildIncludeOptions(options?: Partial<NewsIncludeOptions>): BaseNewsInclude {
        return {
            author: options?.author ?? this.DEFAULT_INCLUDE.author,
            company: options?.company ?? this.DEFAULT_INCLUDE.company,
            event: options?.event ?? this.DEFAULT_INCLUDE.event,
        };
    }

    private transformNewsData<T>(news: T | null): News | null {
        if (!news) return null;

        const transformed = {
            ...news,
            company: news['company'] || undefined,
            event: news['event'] || undefined,
            author: news['author'] || undefined,
        };

        return transformed as unknown as News;
    }

    private async executeNewsQuery(
        where: Prisma.NewsWhereInput | undefined,
        include: BaseNewsInclude,
        orderBy: Prisma.NewsOrderByWithRelationInput = DEFAULT_ORDERING,
    ): Promise<News[]> {
        const news = await this.db.news.findMany({
            where,
            include: include as Prisma.NewsInclude,
            orderBy,
        });

        return news.map(item => this.transformNewsData(item)).filter((item): item is News => item !== null);
    }

    private async executeNewsSingleQuery(
        where: Prisma.NewsWhereUniqueInput,
        include: BaseNewsInclude,
    ): Promise<News | null> {
        const news = await this.db.news.findUnique({
            where,
            include: include as Prisma.NewsInclude,
        });

        return this.transformNewsData(news);
    }

    async create(
        data: Prisma.NewsUncheckedCreateInput,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News> {
        const include = this.buildIncludeOptions(includeOptions);

        const news = await this.db.news.create({
            data,
            include: include as Prisma.NewsInclude,
        });

        const transformed = this.transformNewsData(news);
        if (!transformed) {
            throw new Error('Failed to create news');
        }
        return transformed;
    }

    async findAll(): Promise<News[]> {
        const include = {
            company: true,
            event: true,
        } as const;

        return this.executeNewsQuery(undefined, include);
    }

    async findById(
        id: number,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News | null> {
        const include = this.buildIncludeOptions(includeOptions);
        return this.executeNewsSingleQuery({ id }, include);
    }

    async findByAuthorId(
        authorId: number,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News[]> {
        const include = this.buildIncludeOptions(includeOptions);
        return this.executeNewsQuery({ authorId }, include);
    }

    async findByCompanyId(
        companyId: number,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News[]> {
        const include = this.buildIncludeOptions(includeOptions);
        return this.executeNewsQuery({ companyId }, include);
    }

    async findByEventId(
        eventId: number,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News[]> {
        const include = this.buildIncludeOptions(includeOptions);
        return this.executeNewsQuery({ eventId }, include);
    }

    async update(
        id: number,
        data: Prisma.NewsUncheckedUpdateInput,
        includeOptions?: Partial<NewsIncludeOptions>,
    ): Promise<News> {
        const include = this.buildIncludeOptions(includeOptions);

        const news = await this.db.news.update({
            where: { id },
            data,
            include: include as Prisma.NewsInclude,
        });

        const transformed = this.transformNewsData(news);
        if (!transformed) {
            throw new Error('Failed to update news');
        }
        return transformed;
    }

    async delete(id: number): Promise<void> {
        await this.db.news.delete({
            where: { id },
        });
    }
}
