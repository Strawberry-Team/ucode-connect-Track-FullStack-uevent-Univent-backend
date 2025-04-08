import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AttendeeVisibility, EventStatus } from "@prisma/client";
import { IsISO8601Date, IsTimeDifferenceGreaterThan } from "../../common/validators/date.validator";
import { EVENT_CONSTANTS } from "../constants/event.constants";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    venue: string;

    @IsString()
    @IsNotEmpty()
    locationCoordinates: string;

    //@Transform(({ value }) => new Date(value))
    @IsISO8601Date(false)
    startedAt: Date;

    //@Transform(({ value }) => new Date(value))
    @IsISO8601Date(false)
    @IsTimeDifferenceGreaterThan('startedAt', EVENT_CONSTANTS.MIN_DURATION_MINUTES)
    endedAt: Date;

    @IsISO8601Date(true)
    // @IsTimeDifferenceGreaterThan('startedAt', EVENT_CONSTANTS.MIN_PUBLISH_BEFORE_START_MINUTES)
    publishedAt?: Date;

    @IsISO8601Date(true)
    // @IsTimeDifferenceGreaterThan('startedAt', EVENT_CONSTANTS.MIN_PUBLISH_BEFORE_START_MINUTES)
    ticketsAvailableFrom?: Date;

    @IsString()
    @IsOptional()
    posterName?: string;

    @IsEnum(AttendeeVisibility)
    @IsOptional()
    attendeeVisibility?: AttendeeVisibility;

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;
}


            