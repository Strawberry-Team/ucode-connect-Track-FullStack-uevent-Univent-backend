// src/models/events/events.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventWithRelations } from './entities/event.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import { GetEventsDto } from './dto/get-events.dto';

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

    async findAll(query?: GetEventsDto):
    Promise<{ items: EventWithRelations[]; count: number; total: number; }> {
        const {
            title,
            description,
            venue,
            startedAt,
            status,
            companyId,
            formatId,
            themes,
            minPrice,
            maxPrice,
            skip = 0,
            take = 10
        } = query || {};

        const where: Prisma.EventWhereInput = {
            ...(title && { title: { contains: title } }),
            ...(description && { description: { contains: description } }),
            ...(venue && { venue: { contains: venue } }),
            ...(startedAt && { startedAt: { gte: new Date(startedAt) } }),
            ...(status && status.length > 0 && { status: { in: status } }),
            ...(companyId && { companyId }),
            ...(formatId && { formatId }),
            ...(themes && themes.length > 0 && {
                themesRelation: {
                    some: {
                        themeId: {
                            in: themes
                        }
                    }
                }
            }),
            ...(minPrice !== undefined || maxPrice !== undefined) && {
                tickets: {
                    some: {
                        AND: [
                            { status: TicketStatus.AVAILABLE },
                            ...(minPrice !== undefined ? [{ price: { gte: minPrice } }] : []),
                            ...(maxPrice !== undefined ? [{ price: { lte: maxPrice } }] : [])
                        ]
                    }
                }
            }
        };

        const [items, total] = await Promise.all([
            this.db.event.findMany({
                where,
                include: {
                    themesRelation: {
                        include: {
                            theme: true
                        }
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
                orderBy: {
                    startedAt: 'asc',
                    endedAt: 'asc',
                    title: 'asc',
                },
                skip,
                take,
            }),
            this.db.event.count({ where }),
        ]);

        return {
            items: items.map((event) => EventsRepository.transformEventData(event)),
            count: items.length,
            total,
        };
    }

    async findAllWithTicketPrices(query?: GetEventsDto):
    Promise<{ items: EventWithRelations[]; count: number; total: number; }> {
        const {
            title,
            description,
            venue,
            startedAt,
            status,
            companyId,
            formatId,
            themes,
            minPrice,
            maxPrice,
            skip = 0,
            take = 10
        } = query || {};

        const where: Prisma.EventWhereInput = {
            ...(title && { title: { contains: title } }),
            ...(description && { description: { contains: description } }),
            ...(venue && { venue: { contains: venue } }),
            ...(startedAt && { startedAt: { gte: new Date(startedAt) } }),
            ...(status && status.length > 0 && { status: { in: status } }),
            ...(companyId && { companyId }),
            ...(formatId && { formatId }),
            ...(themes && themes.length > 0 && {
                themesRelation: {
                    some: {
                        themeId: {
                            in: themes
                        }
                    }
                }
            }),
            ...(minPrice !== undefined || maxPrice !== undefined) && {
                tickets: {
                    some: {
                        AND: [
                            { status: TicketStatus.AVAILABLE },
                            ...(minPrice !== undefined ? [{ price: { gte: minPrice } }] : []),
                            ...(maxPrice !== undefined ? [{ price: { lte: maxPrice } }] : [])
                        ]
                    }
                }
            }
        };

        const [items, total] = await Promise.all([
            this.db.event.findMany({
                where,
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
                    tickets: {
                        where: {
                            status: TicketStatus.AVAILABLE,
                            ...(minPrice !== undefined && { price: { gte: minPrice } }),
                            ...(maxPrice !== undefined && { price: { lte: maxPrice } })
                        },
                        select: {
                            id: true,
                            eventId: true,
                            title: true,
                            price: true,
                            status: true,
                        },
                        distinct: ['title'],
                        orderBy: {
                            price: 'asc',
                        },
                    },
                },
                orderBy: {
                    startedAt: 'asc'
                },
                skip,
                take,
            }),
            this.db.event.count({ where }),
        ]);

        return {
            items: items.map((event) => EventsRepository.transformEventData(event)),
            count: items.length,
            total,
        };
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

    async update(id: number, event: Partial<Event>): Promise<EventWithRelations> {
        const updatedEvent = await this.db.event.update({
            where: { id },
            data: event as Prisma.EventUpdateInput,
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

        return EventsRepository.transformEventData(updatedEvent);
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
            tickets: event.tickets?.map(ticket => ({
                ...ticket,
                price: ticket.price ? Number(ticket.price) : null
            })) || undefined,
        };
    }
}
