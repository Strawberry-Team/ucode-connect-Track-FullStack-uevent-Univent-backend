// scr/models/events/event-attendees/entities/event-attendee.entities.ts
import { EventAttendee as PrismaEventAttendee } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../users/entities/user.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    SYSTEMIC: ['basic', 'systemic'],
};

export class EventAttendee implements PrismaEventAttendee {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event Attendee identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event Attendee title',
        nullable: false,
        type: 'number',
        example: 1,
    })
    eventId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    userId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event Attendee visibility',
        nullable: false,
        type: 'boolean',
        default: true,
        example: true,
    })
    isVisible: boolean;

    @Expose({ groups: ['basic'] })
    user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePictureName'>;

    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;
}
