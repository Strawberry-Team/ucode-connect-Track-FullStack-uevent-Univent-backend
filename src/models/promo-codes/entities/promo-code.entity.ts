// src/models/promo-codes/entities/promo-code.entity.ts
import {
    PromoCode as PrismaPromoCode,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

type PromoCodeWithDiscountPercent = Omit<PrismaPromoCode, 'discountPercent'> & {
    discountPercent: number;
};

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'], //ті, які потрапляють на фронт усім
    CONFIDENTIAL: ['basic', 'confidential'], //ті, які може бачити тільки власник(або роль певна). На прикладі user це role
    PRIVATE: ['basic', 'confidential', 'private'], //ті, які ніколи не потрапляють на фронтенд. На прикладі user це password, updated_at
};

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
        example: true,
    })
    isActive: boolean;

    @Expose({ groups: ['confidential'] })
    createdAt: Date;

    @Expose({ groups: ['private'] })
    updatedAt: Date;
}
