import { AttendeeVisibility, EventStatus, Event as PrismaEvent } from "@prisma/client";
import { Expose } from "class-transformer";
export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
};

export class Event implements PrismaEvent {
    @Expose({ groups: ['basic'] })
    id: number;

    @Expose({ groups: ['basic'] })
    companyId: number;

    @Expose({ groups: ['basic'] })
    formatId: number;

    @Expose({ groups: ['basic'] })
    title: string;

    @Expose({ groups: ['basic'] })
    description: string;

    @Expose({ groups: ['basic'] })
    venue: string;  

    @Expose({ groups: ['basic'] })
    locationCoordinates: string;

    @Expose({ groups: ['basic'] })
    startedAt: Date;

    @Expose({ groups: ['basic'] })
    endedAt: Date;  

    @Expose({ groups: ['basic'] })
    publishedAt: Date;

    @Expose({ groups: ['basic'] })
    ticketsAvailableFrom: Date;

    @Expose({ groups: ['basic'] })
    posterName: string; 

    @Expose({ groups: ['basic'] })
    attendeeVisibility: AttendeeVisibility;

    @Expose({ groups: ['basic'] })
    status: EventStatus;

    @Expose({ groups: ['basic'] })
    createdAt: Date;

    @Expose({ groups: ['basic'] })
    updatedAt: Date;
}