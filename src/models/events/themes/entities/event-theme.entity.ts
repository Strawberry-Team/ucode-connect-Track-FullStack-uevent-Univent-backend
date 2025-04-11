// scr/models/companies/entities/company.entity.ts
import { EventTheme as PrismaEventTheme } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    SYSTEMIC: ['basic', 'systemic'],
};

export class EventTheme implements PrismaEventTheme {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Theme identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Theme title',
        nullable: false,
        type: 'string',
        example: 'Computer science',
    })
    title: string;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;
}
