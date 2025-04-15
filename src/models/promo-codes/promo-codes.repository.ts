// src/models/promo-codes/promo-codes.repository.ts
import { Injectable } from '@nestjs/common';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { DatabaseService } from '../../db/database.service';

@Injectable()
export class PromoCodesRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(
        data: CreatePromoCodeDto & { eventId: number },
    ): Promise<PromoCode> {
        const promoCode = await this.db.promoCode.create({
            data,
        });

        const { discountPercent, ...promoCodeWithoutDiscountPercent } =
            promoCode;
        return {
            ...promoCodeWithoutDiscountPercent,
            discountPercent: Number(discountPercent),
        };
    }

    async findOne(id: number): Promise<PromoCode | null> {
        const promoCode = await this.db.promoCode.findUnique({
            where: { id },
        });

        if (!promoCode) {
            return null;
        }

        const { discountPercent, ...promoCodeWithoutDiscountPercent } =
            promoCode;
        return {
            ...promoCodeWithoutDiscountPercent,
            discountPercent: Number(discountPercent),
        };
    }

    async findAllByEventId(eventId: number): Promise<PromoCode[]> {
        const result = await this.db.promoCode.findMany({
            where: { eventId },
        });

        const finalResult: PromoCode[] = [];

        result.forEach((promoCode) => {
            const { discountPercent, ...promoCodeWithoutDiscountPercent } =
                promoCode;
            const result = {
                ...promoCodeWithoutDiscountPercent,
                discountPercent: Number(discountPercent),
            };
            finalResult.push(result);
        });

        return finalResult;
    }

    async update(
        id: number,
        data: Partial<UpdatePromoCodeDto>,
    ): Promise<PromoCode> {
        const promoCode = await this.db.promoCode.update({
            where: { id },
            data,
        });

        const { discountPercent, ...promoCodeWithoutDiscountPercent } =
            promoCode;
        return {
            ...promoCodeWithoutDiscountPercent,
            discountPercent: Number(discountPercent),
        };
    }
}
