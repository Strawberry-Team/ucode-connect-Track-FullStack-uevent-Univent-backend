// src/models/companies/companies.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service';
import { EventTheme } from './entities/event-theme.entity';

@Injectable()
export class EventThemesRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(eventTheme: Partial<EventTheme>): Promise<EventTheme> {
        return this.db.eventTheme.create({ data: eventTheme as any });
    }

    async findAll(): Promise<Pick<EventTheme, 'id' | 'title'>[]> {
        const results = await this.db.eventTheme.findMany({
            where: {
                eventsRelation: {
                    some: {}
                }
            },
            select: {
                id: true,
                title: true
            },
            orderBy: [
                {
                    eventsRelation: {
                        _count: 'desc'
                    }
                },
                { 
                    title: 'asc' 
                }
            ]
        });

        return results;
    }

    async findById(id: number): Promise<EventTheme | null> {
        return this.db.eventTheme.findUnique({ where: { id } });
    }
}
