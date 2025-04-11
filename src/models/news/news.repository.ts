// src/models/news/news.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { News } from './entities/news.entity';
import {
    SERIALIZATION_GROUPS as CompanySerialisationGroups,
    Company,
} from '../companies/entities/company.entity';
import {
    SERIALIZATION_GROUPS as EventSerialisationGroups,
    Event,
} from '../events/entities/event.entity';
import { DatabaseService } from '../../db/database.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NewsRepository {
    constructor(private readonly db: DatabaseService) {}

    private transformNews<T extends News | News[]>(news: T): T {
        const transformSingleNews = (item: News) => {
            if (item.company) {
                item.company = plainToInstance(Company, item.company, {
                    groups: CompanySerialisationGroups.NEWS,
                });
            }

            if (item.event) {
                item.event = plainToInstance(Event, item.event, {
                    groups: EventSerialisationGroups.NEWS,
                });
            }

            return item;
        };

        if (Array.isArray(news)) {
            return news.map(transformSingleNews) as T;
        }

        return transformSingleNews(news) as T;
    }

    private async findNews(where: Prisma.NewsWhereInput): Promise<News[]> {
        const news = await this.db.news.findMany({
            where,
            include: { author: false, company: true, event: true },
            orderBy: { createdAt: 'desc' },
        });

        return this.transformNews(news as News[]);
    }

    async create(data: Partial<News>): Promise<News> {
        const news = await this.db.news.create({
            data: data as any,
            include: { author: false, company: true, event: true },
        });

        return this.transformNews(news as News);
    }

    async findAll(): Promise<News[]> {
        return this.findNews({});
    }

    async findById(id: number): Promise<News | null> {
        const news = await this.db.news.findUnique({
            where: { id },
            include: { author: false, company: true, event: true },
        });

        if (!news) {
            return null;
        }

        return this.transformNews(news as News);
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

    async update(id: number, updateData: Partial<Company>): Promise<News> {
        const news = await this.db.news.update({
            where: { id },
            data: updateData as any,
            include: { author: false, company: true, event: true },
        });

        return this.transformNews(news as News);
    }

    async delete(id: number): Promise<void> {
        await this.db.news.delete({
            where: { id },
        });
    }
}
