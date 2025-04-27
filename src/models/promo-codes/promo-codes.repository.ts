// src/models/promo-codes/promo-codes.repository.ts
import { Injectable } from '@nestjs/common';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { DatabaseService } from '../../db/database.service';
import { Prisma } from '@prisma/client';

type PromoCodeWithNumericDiscount = Omit<PromoCode, 'discountPercent'> & {
    discountPercent: number;
};

@Injectable()
export class PromoCodesRepository {
    constructor(private readonly db: DatabaseService) {}

    private transformPromoCode(
        promoCode: Prisma.PromoCodeGetPayload<{}>
    ): PromoCodeWithNumericDiscount {
        const { discountPercent, ...rest } = promoCode;
        return {
            ...rest,
            discountPercent: Number(discountPercent),
        };
    }

    private transformPromoCodeArray(
        promoCodes: Prisma.PromoCodeGetPayload<{}>[]
    ): PromoCodeWithNumericDiscount[] {
        return promoCodes.map(this.transformPromoCode);
    }

    private buildCreateInput(
        data: CreatePromoCodeDto & { eventId: number }
    ): Prisma.PromoCodeCreateInput {
        return {
            ...data,
            event: { connect: { id: data.eventId } },
        };
    }

    async create(
        data: CreatePromoCodeDto & { eventId: number },
    ): Promise<PromoCodeWithNumericDiscount> {
        const createInput = this.buildCreateInput(data);
        const promoCode = await this.db.promoCode.create({
            data: createInput,
        });

        return this.transformPromoCode(promoCode);
    }

    async findOne(id: number): Promise<PromoCodeWithNumericDiscount | null> {
        const promoCode = await this.db.promoCode.findUnique({
            where: { id },
        });

        if (!promoCode) {
            return null;
        }

        return this.transformPromoCode(promoCode);
    }

    async findAllByEventId(eventId: number): Promise<PromoCodeWithNumericDiscount[]> {
        const promoCodes = await this.db.promoCode.findMany({
            where: { eventId },
        });

        return this.transformPromoCodeArray(promoCodes);
    }

    async update(
        id: number,
        data: Partial<UpdatePromoCodeDto>,
    ): Promise<PromoCodeWithNumericDiscount> {
        const promoCode = await this.db.promoCode.update({
            where: { id },
            data: data as Prisma.PromoCodeUpdateInput,
        });

        return this.transformPromoCode(promoCode);
    }

    async delete(id: number): Promise<void> {
        await this.db.promoCode.delete({
            where: { id },
        });
    }
}
