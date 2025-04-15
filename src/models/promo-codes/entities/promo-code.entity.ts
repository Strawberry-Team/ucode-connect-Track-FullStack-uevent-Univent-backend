// src/models/promo-codes/entities/promo-code.entity.ts
import {
    PromoCode as PrismaPromoCode,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';

type PromoCodeWithDiscountPercent = Omit<PrismaPromoCode, 'discountPercent'> & {
    discountPercent: number;
};

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
    PRIVATE: ['basic', 'confidential', 'private'],
};

// export type PromoCodeWithBasic = Pick<PromoCode, 'eventId' | 'discountPercent' | 'isActive'>;

export class PromoCode implements PromoCodeWithDiscountPercent {
    @Expose({ groups: ['confidential'] })
    @ApiProperty({
        description: 'Promo code identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event identifier associated with the promo code',
        nullable: false,
        type: 'number',
        example: 1,
    })
    eventId: number;

    @Expose({ groups: ['confidential'] })
    @ApiProperty({
        description: 'Promo code title',
        nullable: false,
        type: 'string',
        example: 'For the tech enthusiasts',
        minLength: 1,
        maxLength: 100,
    })
    title: string;

    @Expose({ groups: ['private'] })
    code: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Discount percentage',
        nullable: false,
        type: 'number',
        example: 0.15,
    })
    discountPercent: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Whether the promo code is active',
        nullable: false,
        type: 'boolean',
        example: false,
    })
    isActive: boolean;

    @Expose({ groups: ['confidential'] })
    @ApiProperty({
        description: 'When the promo code was created',
        nullable: false,
        type: 'string',
        example: '2023-07-01T00:00:00.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['private'] })
    updatedAt: Date;
}

export class PromoCodeWithBasic extends PickType(PromoCode, ['eventId', 'discountPercent', 'isActive']) {}

