// src/models/events/entities/event.entity.ts
import {
    AttendeeVisibility,
    EventStatus,
    Event as PrismaEvent,
    TicketStatus,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { EventTheme } from '../themes/entities/event-theme.entity';
import { Company } from '../../companies/entities/company.entity';
import { EventFormat } from '../formats/entities/event-format.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { News } from '../../news/entities/news.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    BASIC_WITH_TICKETS: ['basic', 'tickets'],
    PRIVATE: ['basic', 'confidential'],
    SYSTEMIC: ['basic', 'confidential', 'systemic'],
};

type EventThemeBase = Pick<EventTheme, 'id' | 'title'>;
type CompanyBase = Pick<Company, 'id' | 'title' | 'logoName'>;
type EventFormatBase = Pick<EventFormat, 'id' | 'title'>;

export type EventWithRelations = Omit<Event, 'themesRelation'> & {
    themes?: EventThemeBase[];
    company?: CompanyBase;
    format?: EventFormatBase;
};

export class Event implements PrismaEvent {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company identifier that owns the event',
        nullable: false,
        type: 'number',
        example: 1,
    })
    companyId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event format identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    formatId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event title',
        nullable: false,
        type: 'string',
        example: 'Tech Conference 2023',
    })
    title: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event description',
        nullable: false,
        type: 'string',
        example:
            'Annual technology conference featuring the latest innovations in software development, artificial intelligence, and cloud computing.',
    })
    description: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event venue',
        nullable: false,
        type: 'string',
        example: 'Convention Center',
    })
    venue: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event location coordinates',
        nullable: false,
        type: 'string',
        example: '50.4501,30.5234',
    })
    locationCoordinates: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event start date and time',
        nullable: false,
        type: 'string',
        example: '2023-09-15T09:00:00.000Z',
    })
    startedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event end date and time',
        nullable: false,
        type: 'string',
        example: '2023-09-17T18:00:00.000Z',
    })
    endedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event publication date',
        nullable: true,
        type: 'string',
        example: '2023-08-01T12:00:00.000Z',
    })
    publishedAt: Date | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Date when tickets become available',
        nullable: true,
        type: 'string',
        example: '2023-07-01T00:00:00.000Z',
    })
    ticketsAvailableFrom: Date | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event poster image name',
        nullable: false,
        type: 'string',
        example: 'tech-conference-2023-poster.jpg',
    })
    posterName: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event attendee visibility setting',
        nullable: false,
        type: 'string',
        enum: ['EVERYONE', 'ATTENDEES_ONLY', 'NOBODY'],
        example: 'EVERYONE',
    })
    attendeeVisibility: AttendeeVisibility;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event status',
        nullable: false,
        type: 'string',
        enum: ['DRAFT', 'PUBLISHED', 'SALES_STARTED', 'ONGOING', 'FINISHED', 'CANCELLED'],
        example: 'PUBLISHED',
    })
    status: EventStatus;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event format',
        nullable: true,
        type: EventFormat,
    })
    format?: EventFormat;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event themes',
        nullable: true,
        type: EventTheme,
    })
    themes?: EventTheme[];

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event company',
        nullable: true,
        type: () => PickType(Company, ['id', 'title', 'logoName']),
    })
    company?: Company;

    @Expose({ groups: ['systemic', 'tickets'] })
    @ApiProperty({
        description: 'Unique Ticket prices for Events',
        nullable: false,
        type: 'array',  
        items: {
            type: 'object',
            nullable: true,
            properties: {
                id: { type: 'number', description: 'Ticket identifier', example: 1 },
                eventId: { type: 'number', description: 'Event identifier', example: 1 },
                title: { type: 'string', description: 'Ticket title', example: 'Standard' },
                price: { type: 'number', description: 'Ticket price', example: 100.00 },
                status: { type: 'enum', description: 'Ticket status', example: TicketStatus.AVAILABLE },
            },
            required: ['id', 'eventId', 'title', 'price', 'status'],
        },
        example: [
            {
                "id": 1,
                "eventId": 1,
                "title": "Standard",
                "price": 210.00,
                "status": "AVAILABLE"
            },
            {
                "id": 2,
                "eventId": 1,
                "title": "VIP",
                "price": 580.00,
                "status": "AVAILABLE"
            },
            {
                "id": 4,
                "eventId": 1,
                "title": "Premium",
                "price": 4890.00,
                "status": "AVAILABLE"
            }
        ],
    })
    tickets?: Ticket[];

    @Expose({ groups: ['systemic'] })
    news?: News[];
}