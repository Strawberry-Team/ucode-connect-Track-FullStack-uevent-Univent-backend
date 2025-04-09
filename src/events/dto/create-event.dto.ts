import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AttendeeVisibility, EventStatus } from "@prisma/client";
import { IsISO8601Date, IsTimeDifferenceGreaterThan } from "../../common/validators/date.validator";
import { EVENT_CONSTANTS } from "../constants/event.constants";
import { ApiProperty } from '@nestjs/swagger';
import { IsTitle } from '../../common/validators/title.validator';
import { IsDescription } from '../../common/validators/description.validator';
import { IsId } from '../../common/validators/id.validator';

export class CreateEventDto {
    @IsTitle(false)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Event title',
        nullable: false,
        type: 'string',
        example: 'Tech Conference 2023',
    })
    title: string;

    @IsDescription(true)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Event description',
        nullable: false,
        type: 'string',
        example: 'Annual technology conference featuring the latest innovations in software development, artificial intelligence, and cloud computing.',
    })
    description: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Event venue',
        nullable: false,
        type: 'string',
        example: 'Convention Center',
    })
    venue: string;

    @IsString()
    @IsNotEmpty()
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
    @IsTimeDifferenceGreaterThan('startedAt', EVENT_CONSTANTS.MIN_DURATION_MINUTES)
    @ApiProperty({
        required: true,
        description: 'Event end date and time',
        nullable: false,
        type: 'string',
        example: '2023-09-17T18:00:00.000Z',
    })
    endedAt: Date;

    @Type(() => Date)
    @IsISO8601Date(true, true)
    @IsOptional()
    @ApiProperty({
        required: false,
        description: 'Event publication date',
        nullable: true,
        type: 'string',
        example: '2023-08-01T12:00:00.000Z',
    })
    publishedAt?: Date | null;

    @Type(() => Date)
    @IsISO8601Date(true, true)
    @IsOptional()
    @ApiProperty({
        required: false,
        description: 'Date when tickets become available',
        nullable: true,
        type: 'string',
        example: '2023-07-01T00:00:00.000Z',
    })
    ticketsAvailableFrom?: Date | null;

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        description: 'Event poster image name',
        nullable: true,
        type: 'string',
        example: 'tech-conference-2023-poster.jpg',
    })
    posterName?: string;

    @IsEnum(AttendeeVisibility)
    @IsOptional()
    @ApiProperty({
        required: false,
        description: 'Event attendee visibility setting',
        nullable: true,
        type: 'string',
        enum: ['PUBLIC', 'PRIVATE', 'RESTRICTED'],
        example: 'PUBLIC',
    })
    attendeeVisibility?: AttendeeVisibility;

    @IsEnum(EventStatus)
    @IsOptional()
    @ApiProperty({
        required: false,
        description: 'Event status',
        nullable: true,
        type: 'string',
        enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
        example: 'DRAFT',
    })
    status?: EventStatus;

    @IsId(false)
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Company identifier that owns the event',
        nullable: false,
        type: 'number',
        example: 1,
    })
    companyId: number;

    @IsId(false)
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'Event format identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    formatId: number;
}


            