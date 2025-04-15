// src/models/news/news.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { News } from './entities/news.entity';
import { DatabaseService } from '../../db/database.service';
import { NewsIncludeOptions } from './interfaces/news-include-options.interface';

@Injectable()
export class NewsRepository {
    constructor(private readonly db: DatabaseService) {}

    private readonly DEFAULT_INCLUDE: NewsIncludeOptions = {
        author: false,
        company: false,
        event: false,
    };

    private async findNews(
        where: Prisma.NewsWhereInput | null,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News[]> {
        const include: Prisma.NewsInclude = {
            author: includeOptions.author ?? false,
            company: includeOptions.company ?? false,
            event: includeOptions.event ?? false,
        };
        type NewsWithIncludes = Prisma.NewsGetPayload<{
            include: typeof include;
        }>;

        const news = await this.db.news.findMany({
            where: where ?? undefined,
            include,
            orderBy: { id: 'desc' },
        });

        return news as NewsWithIncludes[] as News[];
    }

    async create(
        data: Partial<News>,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News> {
        const include: Prisma.NewsInclude = includeOptions;
        type NewsWithIncludes = Prisma.NewsGetPayload<{
            include: typeof include;
        }>;

        const news = await this.db.news.create({
            data: data as Prisma.NewsCreateInput,
            include,
        });

        return news as NewsWithIncludes as News;
    }

    async findAll(): Promise<News[]> {
        type NewsWithIncludes = Prisma.NewsGetPayload<{
            include: {
                author: false;
                company: true;
                event: true;
            };
        }>;

        const news = await this.db.news.findMany({
            orderBy: { createdAt: 'desc' },
            include: { company: true, event: true },
        });

        return news as NewsWithIncludes[] as News[];
    }

    async findById(
        id: number,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News | null> {
        const include: Prisma.NewsInclude = includeOptions;
        type NewsWithIncludes = Prisma.NewsGetPayload<{
            include: typeof include;
        }>;

        const news = await this.db.news.findUnique({
            where: { id },
            include,
        });

        if (!news) {
            return null;
        }

        return news as NewsWithIncludes as News;
    }

    async findByAuthorId(
        authorId: number,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News[]> {
        return this.findNews({ authorId }, includeOptions);
    }

    async findByCompanyId(
        companyId: number,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News[]> {
        return this.findNews({ companyId }, includeOptions);
    }

    async findByEventId(
        eventId: number,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News[]> {
        return this.findNews({ eventId }, includeOptions);
    }

    async update(
        id: number,
        updateData: Partial<News>,
        includeOptions: NewsIncludeOptions = this.DEFAULT_INCLUDE,
    ): Promise<News> {
        const include: Prisma.NewsInclude = includeOptions;
        type NewsWithIncludes = Prisma.NewsGetPayload<{
            include: typeof include;
        }>;

        const news = await this.db.news.update({
            where: { id },
            data: updateData as Prisma.NewsUpdateInput,
            include,
        });

        return news as NewsWithIncludes as News;
    }

    async delete(id: number): Promise<void> {
        await this.db.news.delete({
            where: { id },
        });
    }
}
