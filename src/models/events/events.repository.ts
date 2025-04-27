// src/models/events/events.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventWithRelations } from './entities/event.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import { GetEventsDto } from './dto/get-events.dto';

type EventAggregateResult = {
    items: EventWithRelations[];
    count: number;
    total: number;
    minPrice: number | null;
    maxPrice: number | null;
};

const DEFAULT_EVENT_ORDERING = {
    startedAt: 'asc' as const,
    endedAt: 'asc' as const,
    title: 'asc' as const,
} satisfies Prisma.EventOrderByWithRelationInput;

const SIMPLE_EVENT_ORDERING = {
    startedAt: 'asc' as const,
} satisfies Prisma.EventOrderByWithRelationInput;

const BASE_EVENT_INCLUDE: Prisma.EventInclude = {
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
};

const TICKETS_INCLUDE: Prisma.EventInclude = {
    ...BASE_EVENT_INCLUDE,
    tickets: {
        where: {
            status: TicketStatus.AVAILABLE,
        },
        select: {
            id: true,
            eventId: true,
            title: true,
            price: true,
            status: true,
        },
        distinct: ['title'] as const,
        orderBy: {
            price: 'asc',
        },
    },
};

const buildPriceFilter = (minPrice?: number, maxPrice?: number): Prisma.EventWhereInput => {
    if (minPrice === undefined && maxPrice === undefined) {
        return {};
    }

    return {
        tickets: {
            some: {
                AND: [
                    { status: TicketStatus.AVAILABLE },
                    ...(minPrice !== undefined ? [{ price: { gte: minPrice } }] : []),
                    ...(maxPrice !== undefined ? [{ price: { lte: maxPrice } }] : [])
                ]
            }
        }
    };
};

const buildEventWhereClause = (query?: GetEventsDto): Prisma.EventWhereInput => {
    const {
        title,
        description,
        venue,
        startedAt,
        endedAt,
        status,
        companyId,
        formats,
        themes,
        minPrice,
        maxPrice,
    } = query || {};

    const baseWhere: Prisma.EventWhereInput = {
        ...(title && { title: { contains: title } }),
        ...(description && { description: { contains: description } }),
        ...(venue && { venue: { contains: venue } }),
        ...(startedAt && { startedAt: { gte: new Date(startedAt) } }),
        ...(endedAt && { endedAt: { lte: new Date(endedAt) } }),
        ...(status && status.length > 0 && { status: { in: status } }),
        ...(companyId && { companyId }),
        ...(formats && formats.length > 0 && { formatId: { in: formats } }),
        ...(themes && themes.length > 0 && {
            themesRelation: {
                some: {
                    themeId: {
                        in: themes
                    }
                }
            }
        })
    };

    return {
        ...baseWhere,
        ...buildPriceFilter(minPrice, maxPrice)
    };
};

const buildPriceAggregation = (where: Prisma.EventWhereInput): Prisma.TicketAggregateArgs => ({
    where: {
        event: where,
        status: TicketStatus.AVAILABLE
    },
    _min: {
        price: true as const
    },
    _max: {
        price: true as const
    }
});

@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) {}

    private async executeEventQuery(
        where: Prisma.EventWhereInput,
        include: Prisma.EventInclude,
        orderBy: Prisma.EventOrderByWithRelationInput,
        skip?: number,
        take?: number
    ): Promise<EventAggregateResult> {
        const [items, total, priceStats] = await Promise.all([
            this.db.event.findMany({
                where,
                include,
                orderBy,
                skip,
                take,
            }),
            this.db.event.count({ where }),
            this.db.ticket.aggregate(buildPriceAggregation(where))
        ]);

        return {
            items: items.map(EventsRepository.transformEventData),
            count: items.length,
            total,
            minPrice: priceStats._min?.price ? Number(priceStats._min.price) : null,
            maxPrice: priceStats._max?.price ? Number(priceStats._max.price) : null,
        };
    }

    async findAll(query?: GetEventsDto): Promise<EventAggregateResult> {
        const { skip, take } = query || {};
        const where = buildEventWhereClause(query);

        return this.executeEventQuery(
            where,
            BASE_EVENT_INCLUDE,
            DEFAULT_EVENT_ORDERING,
            skip,
            take
        );
    }

    async findAllWithTicketPrices(query?: GetEventsDto): Promise<EventAggregateResult> {
        const { skip, take } = query || {};
        const where = buildEventWhereClause(query);

        return this.executeEventQuery(
            where,
            TICKETS_INCLUDE,
            SIMPLE_EVENT_ORDERING,
            skip,
            take
        );
    }

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
                tickets: {
                    where: {
                        status: TicketStatus.AVAILABLE,
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
