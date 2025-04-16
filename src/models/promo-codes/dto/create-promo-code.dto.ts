// src/models/promo-codes/dto/create-promo-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnglishNameWithNumbers, IsName } from '../../../common/validators/name.validator';
import { IsPercent } from '../../../common/validators/percent.validator';
import { IsBooleanField } from '../../../common/validators/boolean.validator';

export class CreatePromoCodeDto {
    @ApiProperty({
        required: true,
        nullable: false,
        description: 'Promo code title',
        example: 'For the tech enthusiasts',
        minLength: 1,
        maxLength: 100,
        type: 'string',
    })
    @IsName(false, false, 1, 100)
    title: string;

    @ApiProperty({
        required: true,
        nullable: false,
        description: 'The promo code value',
        example: 'TECH2023',
        type: 'string',
    })
    @IsEnglishNameWithNumbers(false, false, 5, 30)
    code: string;

    @ApiProperty({
        required: true,
        nullable: false,
        description: 'Discount percentage (0 to 1)',
        example: 0.15,
        type: 'number',
    })
    @IsPercent(false)
    discountPercent: number;

    @ApiProperty({
        required: false,
        nullable: false,
        description: 'Whether the promo code is active',
        example: true,
        type: 'boolean',
    })
    @IsBooleanField(true)
    isActive?: boolean;
}
