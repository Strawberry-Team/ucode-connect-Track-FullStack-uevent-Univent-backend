import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AttendeeVisibility, EventStatus } from "@prisma/client";
import { ValidateEventDates } from "../validators/event-dates.validator";

@ValidateEventDates()
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

    @IsDate()
    @IsNotEmpty()
    startedAt: Date;

    @IsDate()
    @IsNotEmpty()
    endedAt: Date;

    @IsDate()
    @IsNotEmpty()
    publishedAt: Date;  

    @IsDate()
    @IsNotEmpty()
    ticketsAvailableFrom: Date;

    @IsString()
    @IsNotEmpty()
    posterName: string;

    @IsEnum(AttendeeVisibility)
    @IsNotEmpty()
    attendeeVisibility: AttendeeVisibility;

    @IsEnum(EventStatus)
    @IsNotEmpty()
    status: EventStatus;
}


            