// src/models/promo-codes/dto/promo-code-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PromoCodeInfoDto {
    @Expose()
    @ApiProperty({
        description: 'Discount percentage (e.g., 0.25 for 25%)',
        example: 0.25,
        type: 'number',
        format: 'float',
    })
    discountPercent: number;
}
