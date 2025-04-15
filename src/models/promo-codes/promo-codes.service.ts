// src/models/promo-codes/promo-codes.service.ts
import {
    ConflictException,
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
        try {
            await this.findOneByEventIdAndCode(eventId, dto.code);

            throw new ConflictException('Promo code with this code already exists for this event');
        } catch (error) {
            if (!(error instanceof NotFoundException)) {
                throw error;
            }
        }

        const hashedCode = await this.hashingPromoCodesService.hash(dto.code);

        if (dto.isActive === undefined) {
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
        const allCodes = await this.promoCodesRepository.findAllByEventId(eventId);

        let matchingPromoCode: PromoCode | null = null;
        for (const promoCode of allCodes) {
            if (await this.hashingPromoCodesService.compare(code, promoCode.code)) {
                matchingPromoCode = promoCode;
                break;
            }
        }

        if (!matchingPromoCode) {
            throw new NotFoundException('Promo code not found of this event');
        }

        const result = {
            promoCode: plainToInstance(PromoCode, matchingPromoCode, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        };

        if (!matchingPromoCode.isActive) {
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
        const promoCode =  await this.promoCodesRepository.update(id, dto);

        return plainToInstance(PromoCode, promoCode, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }
}
