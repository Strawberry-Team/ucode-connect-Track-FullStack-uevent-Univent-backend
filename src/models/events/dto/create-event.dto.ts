// src/models/events/dto/create-event.dto.ts
import { Type } from 'class-transformer';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import {
    IsISO8601Date,
    IsTimeDifferenceGreaterThan,
} from '../../../common/validators/date.validator';
import { EVENT_CONSTANTS } from '../constants/event.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators/name.validator';
import { IsDescription } from '../../../common/validators/description.validator';
import { IsId } from '../../../common/validators/id.validator';
import { IsCoordinates } from '../validators/events.validator';
import { IsEnumValue } from '../../../common/validators/enum.validator';

export class CreateEventDto {
    @IsName(false)
    @ApiProperty({
        required: true,
        description: 'Event title',
        nullable: false,
        type: 'string',
        example: 'Tech Conference 2023',
    })
    title: string;

    @IsDescription(true)
    @ApiProperty({
        required: true,
        description: 'Event description',
        nullable: false,
        type: 'string',
        example:
            'Annual technology conference featuring the latest innovations in software development, artificial intelligence, and cloud computing.',
    })
    description: string;

    @IsName(false, false, 4, 255)
    @ApiProperty({
        required: true,
        description: 'Event venue',
        nullable: false,
        type: 'string',
        example: 'Convention Center',
    })
    venue: string;

    @IsCoordinates(false)
    @ApiProperty({
        required: true,
        description: 'Event location coordinates',
        nullable: false,
        type: 'string',
        example: '50.4501,30.5234',
    })
    locationCoordinates: string;

    @IsISO8601Date(false)
    @Type(() => Date)
    @ApiProperty({
        required: true,
        description: 'Event start date and time',
        nullable: false,
        type: 'string',
        example: '2023-09-15T09:00:00.000Z',
    })
    startedAt: Date;

    @IsISO8601Date(false)
    @Type(() => Date)
    @IsTimeDifferenceGreaterThan(
        'startedAt',
        EVENT_CONSTANTS.MIN_DURATION_MINUTES,
    )
    @ApiProperty({
        required: true,
        description: 'Event end date and time',
        nullable: false,
        type: 'string',
        example: '2023-09-17T18:00:00.000Z',
    })
    endedAt: Date;

    @IsISO8601Date(true, true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Event publication date',
        nullable: true,
        type: 'string',
        example: '2023-08-01T12:00:00.000Z',
    })
    publishedAt?: Date | null;

    @IsISO8601Date(true, true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Date when tickets become available',
        nullable: true,
        type: 'string',
        example: '2023-07-01T00:00:00.000Z',
    })
    ticketsAvailableFrom?: Date | null;

    @IsName(true, false, 5, 255)
    @ApiProperty({
        required: false,
        description: 'Event poster image name',
        nullable: true,
        type: 'string',
        example: 'tech-conference-2023-poster.jpg',
    })
    posterName?: string;

    @IsEnumValue(AttendeeVisibility, true)
    @ApiProperty({
        required: false,
        description: 'Event attendee visibility setting',
        nullable: true,
        type: 'string',
        enum: AttendeeVisibility,
        example: AttendeeVisibility.EVERYONE,
    })
    attendeeVisibility?: AttendeeVisibility;

    @IsEnumValue(EventStatus, true)
    @ApiProperty({
        required: false,
        description: 'Event status',
        nullable: true,
        type: 'string',
        enum: EventStatus,
        example: EventStatus.DRAFT,
    })
    status?: EventStatus;

    //TODO: remove this field
    @IsId(false)
    @ApiProperty({
        required: true,
        description: 'Company identifier that owns the event',
        nullable: false,
        type: 'number',
        example: 1,
    })
    companyId: number;

    //TODO: Validate this field in service
    @IsId(false)
    @ApiProperty({
        required: true,
        description: 'Event format identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    formatId: number;
}
