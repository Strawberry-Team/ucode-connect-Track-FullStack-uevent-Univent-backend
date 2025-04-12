// src/models/news/news.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { News } from './entities/news.entity';
import { DatabaseService } from '../../db/database.service';

@Injectable()
export class NewsRepository {
    constructor(private readonly db: DatabaseService) {}

    private async findNews(where: Prisma.NewsWhereInput): Promise<News[]> {
        const news = await this.db.news.findMany({
            where,
            include: { author: false, company: false, event: false },
            orderBy: { createdAt: 'desc' },
        });

        return news as News[];
    }

    async create(data: Partial<News>): Promise<News> {
        const news = await this.db.news.create({
            data: data as any,
            include: { author: false, company: false, event: false },
        });

        return news as News;
    }

    async findAll(): Promise<News[]> {
        return this.findNews({});
    }

    async findById(id: number): Promise<News | null> {
        const news = await this.db.news.findUnique({
            where: { id },
            include: { author: false, company: false, event: false },
        });

        if (!news) {
            return null;
        }

        return news as News;
    }

    async findByAuthorId(authorId: number): Promise<News[]> {
        return this.findNews({ authorId });
    }

    async findByCompanyId(companyId: number): Promise<News[]> {
        return this.findNews({ companyId });
    }

    async findByEventId(eventId: number): Promise<News[]> {
        return this.findNews({ eventId });
    }

    async update(id: number, updateData: Partial<News>): Promise<News> {
        const news = await this.db.news.update({
            where: { id },
            data: updateData as any,
            include: { author: false, company: false, event: false },
        });

        return news as News;
    }

    async delete(id: number): Promise<void> {
        await this.db.news.delete({
            where: { id },
        });
    }
}
