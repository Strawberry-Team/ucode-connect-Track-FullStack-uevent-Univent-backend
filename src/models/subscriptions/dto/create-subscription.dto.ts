// src/models/subscriptions/dto/create-subscription.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnumValue } from '../../../common/validators/enum.validator';
import { IsId } from '../../../common/validators/id.validator';

export enum EntityType {
    EVENT = 'event',
    COMPANY = 'company',
}

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'ID of entity to subscribe to (event or company)',
        type: Number,
        example: 5,
    })
    @IsId(false)
    entityId: number;

    @ApiProperty({
        description: 'Type of entity to subscribe to',
        enum: EntityType,
        enumName: 'EntityType',
        example: EntityType.EVENT,
    })
    @IsEnumValue(EntityType, false)
    entityType: EntityType;
}
