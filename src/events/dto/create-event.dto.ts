import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
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

    @IsISO8601Date(false)
    @Type(() => Date)
    startedAt: Date;

    @IsISO8601Date(false)
    @Type(() => Date)
    @IsTimeDifferenceGreaterThan('startedAt', EVENT_CONSTANTS.MIN_DURATION_MINUTES)
    endedAt: Date;

    @Type(() => Date)
    @IsISO8601Date(true, true)
    publishedAt?: Date | null;

    @Type(() => Date)
    @IsISO8601Date(true, true)
    ticketsAvailableFrom?: Date | null;

    @IsString()
    @IsOptional()
    posterName?: string;

    @IsEnum(AttendeeVisibility)
    @IsOptional()
    attendeeVisibility?: AttendeeVisibility;

    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;

    @IsNumber()
    @IsNotEmpty()
    companyId: number;

    @IsNumber()
    @IsNotEmpty()
    formatId: number;
}


            