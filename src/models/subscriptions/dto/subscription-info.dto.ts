// src/models/subscriptions/dto/subscription-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionInfoDto {
    @ApiProperty({
        description: 'Total number of subscribers ',
        example: 42,
        type: Number,
    })
    subscribersCount: number;

    @ApiProperty({
        description: 'Subscription ID of the current user (if the user is subscribed)',
        example: 123,
        type: Number,
        required: false,
        nullable: true,
    })
    subscriptionId?: number;
}
