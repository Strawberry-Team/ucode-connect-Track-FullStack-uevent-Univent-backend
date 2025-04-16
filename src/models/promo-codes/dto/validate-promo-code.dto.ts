// src/models/promo-codes/dto/validate-promo-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnglishNameWithNumbers } from '../../../common/validators/name.validator';
import { IsId } from '../../../common/validators/id.validator';

export class ValidatePromoCodeDto {
    @ApiProperty({
        required: true,
        nullable: false,
        description: 'The promo code value',
        example: 'TECH2023',
        type: 'string',
    })
    @IsEnglishNameWithNumbers(false, false, 1, 30)
    code: string;

    @ApiProperty({
        required: true,
        nullable: false,
        description: 'Event identifier associated with the promo code',
        example: 1,
        type: 'number',
    })
    @IsId(false)
    eventId: number;
}
