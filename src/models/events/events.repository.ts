// src/models/events/events.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { Event, EventWithRelations } from './entities/event.entity';

@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(event: Partial<Event>): Promise<Event> {
        return this.db.event.create({ data: event as any });
    }

    async findAll(): Promise<EventWithRelations[]> {
        const events = await this.db.event.findMany({
            include: {
                themesRelation: {
                    include: { theme: true }
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true
                    }
                },
                format: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return events.map(event => this.transformEventData(event));
    }

    async findById(id: number): Promise<EventWithRelations | null> {
        const event = await this.db.event.findUnique({
            where: { id },
            include: {
                themesRelation: {
                    include: { theme: true }
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true
                    }
                },
                format: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return event ? this.transformEventData(event) : null;
    }

    async findByCompanyId(companyId: number): Promise<EventWithRelations[]> {
        const events = await this.db.event.findMany({
            where: { companyId },
            include: {
                themesRelation: {
                    include: { theme: true }
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true
                    }
                },
                format: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return events.map(event => this.transformEventData(event));
    }

    async update(id: number, event: Event): Promise<Event> {
        return this.db.event.update({ where: { id }, data: event as any });
    }

    async delete(id: number): Promise<void> {
        await this.db.event.delete({ where: { id } });
    }

    async syncThemes(eventId: number, themesIds: number[]): Promise<void> {
        await this.db.eventThemeRelation.deleteMany({ where: { eventId } });
        await this.db.eventThemeRelation.createMany({
            data: themesIds.map(themeId => ({ eventId, themeId }))
        });
    }

    private transformEventData(event: any): EventWithRelations {
        return {
            ...event,
            themes: event.themesRelation
                ?.filter(relation => relation.theme)
                .map(relation => ({
                    id: relation.theme.id,
                    title: relation.theme.title
                })) || [],
            themesRelation: undefined
        };
    }
}
