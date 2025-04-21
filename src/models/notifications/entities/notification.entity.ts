// src/models/notifications/entities/notification.entity.ts
import { ApiProperty, PickType } from "@nestjs/swagger";
import { Notification as PrismaNotification } from "@prisma/client";
import { Expose } from "class-transformer";
import { Event } from "../../events/entities/event.entity";
import { Company } from "../../companies/entities/company.entity";

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic']
};

export class Notification implements PrismaNotification {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;
    
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User identifier',
        type: 'number',
        example: 1,
    })
    userId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event identifier',
        type: 'number',
        example: 1,
        nullable: true,
    })
    eventId: number | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company identifier',
        type: 'number',
        example: 1,
        nullable: true,
    })
    companyId: number | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification title',
        nullable: false,
        type: 'string',
        example: 'Notification title',
    })
    title: string;


    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification content',
        nullable: false,
        type: 'string',
        example: 'Notification content',
    })
    content: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification read date',
        nullable: true,
        type: 'string',
        example: '2024-04-12T12:34:56.000Z',
    })
    readAt: Date | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification hidden date',
        nullable: true,
        type: 'string',
        example: '2024-04-12T12:34:56.000Z',
    })
    hiddenAt: Date | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Notification creation date',
        nullable: false,
        type: 'string',
        example: '2024-04-16T12:34:56.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event',
        nullable: true,
        type: () => PickType(Event, ['id', 'title']),
    })
    event?: Pick<Event, 'id' | 'title'> | null;    

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company',
        nullable: true,
        type: () => PickType(Company, ['id', 'title']),
    })
    company?: Pick<Company, 'id' | 'title'> | null;
}
