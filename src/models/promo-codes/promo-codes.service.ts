// src/models/promo-codes/promo-codes.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodesRepository } from './promo-codes.repository';
import { HashingPromoCodesService } from './hashing-promo-codes.service';
import { plainToInstance } from 'class-transformer';
import { PromoCode, SERIALIZATION_GROUPS } from './entities/promo-code.entity';

@Injectable()
export class PromoCodesService {
    constructor(
        private readonly promoCodesRepository: PromoCodesRepository,
        private readonly hashingPromoCodesService: HashingPromoCodesService,
    ) {}

    async create(dto: CreatePromoCodeDto, eventId: number): Promise<PromoCode> {
        const hashedCode = await this.hashingPromoCodesService.hash(dto.code);

        if (!dto.isActive) {
            dto.isActive = true;
        }

        const promoCode = await this.promoCodesRepository.create({
            ...dto,
            code: hashedCode,
            eventId,
        });

        return plainToInstance(PromoCode, promoCode, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async findAllByEventId(eventId: number): Promise<PromoCode[]> {
        const promoCodes =
            await this.promoCodesRepository.findAllByEventId(eventId);

        return promoCodes.map((code) =>
            plainToInstance(PromoCode, code, {
                groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
            }),
        );
    }

    async findOneByEventIdAndCode(
        eventId: number,
        code: string,
    ): Promise<{
        promoCode: PromoCode;
        explanationMessage?: string;
    }> {
        const hashedCode = await this.hashingPromoCodesService.hash(code);

        const promoCode =
            await this.promoCodesRepository.findOneByEventIdAndCode(
                eventId,
                hashedCode,
            );

        if (!promoCode) {
            throw new NotFoundException('Promo code not found');
        }

        const result = {
            promoCode: plainToInstance(PromoCode, promoCode, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        };

        if (!promoCode.isActive) {
            return {
                ...result,
                explanationMessage: 'Promo code is not active'
            };
        }

        return result;
    }

    async validatePromoCode(eventId: number, code: string): Promise<boolean> {
        try {
            const { promoCode, explanationMessage } = await this.findOneByEventIdAndCode(
                eventId,
                code,
            );

            return !explanationMessage;
        } catch (error) {
            return false;
        }
    }

    async findOne(id: number): Promise<PromoCode> {
        const promoCode = await this.promoCodesRepository.findOne(id);

        if (!promoCode) {
            throw new NotFoundException('Promo code not found');
        }

        return plainToInstance(PromoCode, promoCode, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async update(id: number, dto: UpdatePromoCodeDto): Promise<PromoCode> {
        await this.findOne(id);
        return await this.promoCodesRepository.update(id, dto);
    }
}
