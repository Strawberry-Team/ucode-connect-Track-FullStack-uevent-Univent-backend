// src/models/events/events.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventWithRelations } from './entities/event.entity';
import { Prisma, TicketStatus } from '@prisma/client';
import { GetEventsDto } from './dto/get-events.dto';
import { EventSortField, SortOrder, EventAggregationDto } from './dto/event-aggregation.dto';
import { EventAggregateResult, AppliedFilter } from './types/event-aggregate-result.type';

const DEFAULT_SORT = {
    field: EventSortField.POPULARITY,
    order: SortOrder.DESC,
};

const DEFAULT_EVENT_ORDERING = [
    { startedAt: 'asc' as const },
    { title: 'asc' as const },
] satisfies Prisma.EventOrderByWithRelationInput[];

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
            title: true,
            price: true,
        },
        distinct: ['title', 'price'],
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

const buildOrderByClause = (sort: { field: EventSortField; order: SortOrder }): Prisma.EventOrderByWithRelationInput[] => {
    const order = sort.order.toLowerCase() as Prisma.SortOrder;

    switch (sort.field) {
        case EventSortField.POPULARITY:
            return [{
                tickets: {
                    _count: order
                }
            }];
        case EventSortField.TITLE:
            return [{ title: order }];
        case EventSortField.STARTED_AT:
            return [{ startedAt: order }];
        case EventSortField.MIN_PRICE:
            return DEFAULT_EVENT_ORDERING;
        default:
            return DEFAULT_EVENT_ORDERING;
    }
};

const extractAppliedFilters = (query?: GetEventsDto): AppliedFilter[] => {
    if (!query) return [];

    const filters: AppliedFilter[] = [];

    if (query.title) {
        filters.push({ field: 'title', value: query.title });
    }
    if (query.description) {
        filters.push({ field: 'description', value: query.description });
    }
    if (query.venue) {
        filters.push({ field: 'venue', value: query.venue });
    }
    if (query.startedAt) {
        filters.push({ field: 'startedAt', value: new Date(query.startedAt) });
    }
    if (query.endedAt) {
        filters.push({ field: 'endedAt', value: new Date(query.endedAt) });
    }
    if (query.status) {
        filters.push({ field: 'status', value: query.status });
    }
    if (query.companyId) {
        filters.push({ field: 'companyId', value: Number(query.companyId) });
    }
    if (query.formats) {
        filters.push({ field: 'formats', value: query.formats.map(Number) });
    }
    if (query.themes) {
        filters.push({ field: 'themes', value: query.themes.map(Number) });
    }
    if (query.minPrice) {
        filters.push({ field: 'minPrice', value: Number(query.minPrice) });
    }
    if (query.maxPrice) {
        filters.push({ field: 'maxPrice', value: Number(query.maxPrice) });
    }

    return filters;
};

@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) {}

    private async executeEventQuery(
        where: Prisma.EventWhereInput,
        include: Prisma.EventInclude,
        query?: GetEventsDto,
    ): Promise<EventAggregateResult> {
        // Handle popularity sorting
        if (query?.sortBy === EventSortField.POPULARITY) {
            // Get events with sold tickets count
            const eventsWithCount = await this.db.event.findMany({
                where: {
                    ...where,
                    tickets: {
                        some: {
                            status: TicketStatus.SOLD,
                        },
                    },
                },
                include: {
                    ...include,
                    _count: {
                        select: {
                            tickets: {
                                where: {
                                    status: TicketStatus.SOLD
                                }
                            }
                        }
                    }
                },
            });

            // Sort by sold tickets count
            const sortedEvents = eventsWithCount.sort((a, b) => {
                const aCount = a._count?.tickets || 0;
                const bCount = b._count?.tickets || 0;
                return query.sortOrder === SortOrder.ASC ? aCount - bCount : bCount - aCount;
            });

            // Apply pagination after sorting
            const paginatedEvents = sortedEvents.slice(query.skip || 0, (query.skip || 0) + (query.take || sortedEvents.length));

            const [total, priceStats] = await Promise.all([
                this.db.event.count({ where }),
                this.db.ticket.aggregate(buildPriceAggregation(where))
            ]);

            return {
                items: paginatedEvents.map(EventsRepository.transformEventData),
                filteredBy: extractAppliedFilters(query),
                count: paginatedEvents.length,
                total,
                minPrice: priceStats._min?.price ? Number(priceStats._min.price) : null,
                maxPrice: priceStats._max?.price ? Number(priceStats._max.price) : null,
                sortedBy: {
                    field: query.sortBy || EventSortField.STARTED_AT,
                    order: query.sortOrder || SortOrder.ASC
                }
            };
        }

        // Handle price sorting
        if (query?.sortBy === EventSortField.MIN_PRICE) {
            const events = await this.db.event.findMany({
                where: {
                    ...where,
                    tickets: {
                        some: {
                            status: TicketStatus.AVAILABLE
                        }
                    }
                },
                include: {
                    ...include,
                    tickets: {
                        where: {
                            status: TicketStatus.AVAILABLE
                        },
                        select: {
                            id: true,
                            title: true,
                            price: true,
                        },
                        distinct: ['title', 'price'],
                        orderBy: {
                            price: 'asc'
                        }
                    }
                }
            });

            // Sort by price
            const sortedEvents = events.sort((a, b) => {
                const aTickets = a.tickets || [];
                const bTickets = b.tickets || [];

                if (aTickets.length === 0) return 1;
                if (bTickets.length === 0) return -1;

                const aPrices = aTickets.map(t => Number(t.price));
                const bPrices = bTickets.map(t => Number(t.price));

                const aPrice = Math.min(...aPrices);
                const bPrice = Math.min(...bPrices);

                return query.sortOrder === SortOrder.ASC ? aPrice - bPrice : bPrice - aPrice;
            });

            // Apply pagination after sorting
            const paginatedEvents = sortedEvents.slice(query.skip || 0, (query.skip || 0) + (query.take || sortedEvents.length));

            const [total, priceStats] = await Promise.all([
                this.db.event.count({ where }),
                this.db.ticket.aggregate(buildPriceAggregation(where))
            ]);

            return {
                items: paginatedEvents.map(EventsRepository.transformEventData),
                filteredBy: extractAppliedFilters(query),
                count: paginatedEvents.length,
                total,
                minPrice: priceStats._min?.price ? Number(priceStats._min.price) : null,
                maxPrice: priceStats._max?.price ? Number(priceStats._max.price) : null,
                sortedBy: {
                    field: query.sortBy || EventSortField.STARTED_AT,
                    order: query.sortOrder || SortOrder.ASC
                }
            };
        }

        // Handle other sorting fields
        const orderBy = query?.sortBy && query?.sortOrder
            ? buildOrderByClause({ field: query.sortBy, order: query.sortOrder })
            : DEFAULT_EVENT_ORDERING;

        const events = await this.db.event.findMany({
            where,
            include,
            orderBy,
            skip: query?.skip,
            take: query?.take,
        });

        const [total, priceStats] = await Promise.all([
            this.db.event.count({ where }),
            this.db.ticket.aggregate(buildPriceAggregation(where))
        ]);

        return {
            items: events.map(EventsRepository.transformEventData),
            filteredBy: extractAppliedFilters(query),
            count: events.length,
            total,
            minPrice: priceStats._min?.price ? Number(priceStats._min.price) : null,
            maxPrice: priceStats._max?.price ? Number(priceStats._max.price) : null,
            sortedBy: query?.sortBy && query?.sortOrder ? {
                field: query.sortBy,
                order: query.sortOrder
            } : DEFAULT_SORT,
        };
    }

    async findAll(query?: GetEventsDto): Promise<EventAggregateResult> {
        const { skip, take, ...filterQuery } = query || {};
        const where = buildEventWhereClause(filterQuery);

        return this.executeEventQuery(
            where,
            BASE_EVENT_INCLUDE,
            query
        );
    }

    async findAllWithTicketPrices(query?: GetEventsDto): Promise<EventAggregateResult> {
        const { skip, take, ...filterQuery } = query || {};
        const where = buildEventWhereClause(filterQuery);

        return this.executeEventQuery(
            where,
            TICKETS_INCLUDE,
            query
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
                        title: true,
                        price: true,
                    },
                    distinct: ['title', 'price'],
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
                id: ticket.id,
                title: ticket.title,
                price: ticket.price ? Number(ticket.price) : null,
            })) || undefined,
        };
    }
}
