// src/models/formats/entities/format.entity.ts
import { EventFormat as PrismaFormat } from "@prisma/client";
import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../events/entities/event.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic']
};

export class Format implements PrismaFormat {
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
