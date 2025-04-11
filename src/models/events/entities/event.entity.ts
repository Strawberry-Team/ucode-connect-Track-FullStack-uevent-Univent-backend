// src/models/events/entities/event.entity.ts
import {
    AttendeeVisibility,
    EventStatus,
    Event as PrismaEvent,
} from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Format } from '../../formats/entities/format.entity';
import { Company } from '../../companies/entities/company.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { News } from '../../news/entities/news.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    PRIVATE: ['basic', 'private'],
    SYSTEMIC: ['basic', 'private', 'systemic'],
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
        enum: ['PUBLIC', 'PRIVATE', 'RESTRICTED'],
        example: 'PUBLIC',
    })
    attendeeVisibility: AttendeeVisibility;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event status',
        nullable: false,
        type: 'string',
        enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
        example: 'PUBLISHED',
    })
    status: EventStatus;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['systemic'] })
    format?: Format;

    @Expose({ groups: ['systemic'] })
    company?: Company;

    @Expose({ groups: ['systemic'] })
    tickets?: Ticket[];

    @Expose({ groups: ['systemic'] })
    news?: News[];
}
