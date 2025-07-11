// src/models/events/formats/entities/event-format.entity.ts
import { EventFormat as PrismaEventFormat } from "@prisma/client";
import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../entities/event.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic']
};

export class EventFormat implements PrismaEventFormat {
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
        description: 'Format title',
        nullable: false,
        type: 'string',
        example: 'Conference',
    })
    title: string;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['systemic'] })
    events?: Event[];
}
