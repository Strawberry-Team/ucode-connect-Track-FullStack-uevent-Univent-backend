// src/models/subscriptions/entities/subscription.entity.ts
import {
    Subscription as PrismaSubscription,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserWithBasic } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { CompanyWithBasic } from '../../companies/entities/company.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    USERS: ['basic', 'users'],
    EVENTS: ['basic', 'events', 'createdAt'],
    COMPANIES: ['basic', 'companies', 'createdAt'],
    CONFIDENTIAL: ['basic', 'confidential'],
    PRIVATE: ['basic', 'confidential', 'private'],
};

export class Subscription implements PrismaSubscription {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Subscription identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['confidential', 'users'] })
    @ApiProperty({
        description: 'User identifier who subscribed',
        nullable: false,
        type: 'number',
        example: 1,
    })
    userId: number;

    @Expose({ groups: ['confidential', 'events'] })
    @ApiProperty({
        description: 'Event identifier (if subscribed to an event)',
        nullable: true,
        type: 'number',
        example: 1,
    })
    eventId: number | null;

    @Expose({ groups: ['confidential', 'companies'] })
    @ApiProperty({
        description: 'Company identifier (if subscribed to a company)',
        nullable: true,
        type: 'number',
        example: 1,
    })
    companyId: number | null;

    @Expose({ groups: ['confidential', 'createdAt'] })
    @ApiProperty({
        description: 'Creation date',
        type: 'string',
        example: '2023-09-10T12:00:00.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['users'] })
    @ApiProperty({
        description: 'User who subscribed',
        nullable: true,
        type: UserWithBasic,
    })
    user?: UserWithBasic;

    @Expose({ groups: ['events'] })
    @ApiProperty({
        description: 'Event that user subscribed to',
        nullable: true,
        type: Event,
    })
    event?: Event | null;

    @Expose({ groups: ['companies'] })
    @ApiProperty({
        description: 'Company that user subscribed to',
        nullable: true,
        type : CompanyWithBasic,
    })
    company?: CompanyWithBasic | null;
}

export class SubscriptionWithBasic extends PickType(Subscription, ['id']) {}
export class SubscriptionWithConfidential extends PickType(Subscription, ['id', 'userId', 'eventId', 'companyId', 'createdAt']) {}
export class SubscriptionWithUsers extends PickType(Subscription, ['id', 'userId', 'user']) {}
export class SubscriptionWithEvents extends PickType(Subscription, ['id', 'eventId', 'createdAt', 'event']) {}
export class SubscriptionWithCompanies extends PickType(Subscription, ['id', 'companyId', 'createdAt', 'company']) {}
