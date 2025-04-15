// src/models/promo-codes/dto/update-promo-code.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePromoCodeDto } from './create-promo-code.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePromoCodeDto extends PartialType(
    OmitType(CreatePromoCodeDto, ['code', 'discountPercent'] as const),
) {}
