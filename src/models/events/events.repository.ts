// src/models/events/events.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventWithRelations } from './entities/event.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(event: Partial<Event>): Promise<Event> {
        return this.db.event.create({ data: event as Prisma.EventCreateInput });
    }

    async createWithThemes(event: CreateEventDto) {
        const { themes, ...eventData } = event as CreateEventDto & { themes?: number[] };

        return this.db.event.create({
            data: {
                ...eventData,
                themesRelation: themes ? {
                    create: themes.map(themeId => ({
                        theme: {
                            connect: { id: themeId }
                        }
                    }))
                } : undefined
            },
            include: {
                themesRelation: {
                    include: {
                        theme: true
                    }
                }
            }
        });
    }

    async findAll(): Promise<EventWithRelations[]> {
        const events = await this.db.event.findMany({
            include: {
                themesRelation: {
                    include: { theme: true },
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true,
                    },
                },
                format: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return events.map((event) => EventsRepository.transformEventData(event));
    }

    async findById(id: number): Promise<EventWithRelations | null> {
        const event = await this.db.event.findUnique({
            where: { id },
            include: {
                themesRelation: {
                    include: { theme: true },
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true,
                    },
                },
                format: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return event ? EventsRepository.transformEventData(event) : null;
    }

    async findByCompanyId(companyId: number): Promise<EventWithRelations[]> {
        const events = await this.db.event.findMany({
            where: { companyId },
            include: {
                themesRelation: {
                    include: { theme: true },
                },
                company: {
                    select: {
                        id: true,
                        title: true,
                        logoName: true,
                    },
                },
                format: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return events.map((event) => EventsRepository.transformEventData(event));
    }

    async update(id: number, event: Partial<Event>): Promise<Event> {
        return this.db.event.update({
            where: { id },
            data: event as Prisma.EventUpdateInput,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.event.delete({ where: { id } });
    }

    async syncThemes(eventId: number, themesIds: number[]): Promise<void> {
        await this.db.eventThemeRelation.deleteMany({ where: { eventId } });
        await this.db.eventThemeRelation.createMany({
            data: themesIds.map((themeId) => ({ eventId, themeId })),
        });
    }

    static transformEventData(event: any): EventWithRelations {
        return {
            ...event,
            themes:
                event.themesRelation
                    ?.filter((relation) => relation.theme)
                    .map((relation) => ({
                        id: relation.theme.id,
                        title: relation.theme.title,
                    })) || [],
            themesRelation: undefined,
        };
    }
}
