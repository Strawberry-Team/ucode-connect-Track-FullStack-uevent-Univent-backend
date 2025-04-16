// src/models/promo-codes/promo-codes.service.ts
import {
    ConflictException, ImATeapotException,
    Injectable,
    NotFoundException, UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodesRepository } from './promo-codes.repository';
import { HashingPromoCodesService } from './hashing-promo-codes.service';
import { plainToInstance } from 'class-transformer';
import {
    PromoCode,
    PromoCodeWithBasic,
    SERIALIZATION_GROUPS,
} from './entities/promo-code.entity';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@Injectable()
export class PromoCodesService {
    constructor(
        private readonly promoCodesRepository: PromoCodesRepository,
        private readonly hashingPromoCodesService: HashingPromoCodesService,
    ) {}

    async create(dto: CreatePromoCodeDto, eventId: number): Promise<PromoCode> {
        try {
            await this.validatePromoCode({ code: dto.code, eventId });

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

    async validatePromoCode(
        dto: ValidatePromoCodeDto
    ): Promise<{
        promoCode: PromoCodeWithBasic;
    }> {
        const allCodes = await this.promoCodesRepository.findAllByEventId(dto.eventId);

        let matchingPromoCode: PromoCode | null = null;
        for (const promoCode of allCodes) {
            if (await this.hashingPromoCodesService.compare(dto.code, promoCode.code)) {
                matchingPromoCode = promoCode;
                break;
            }
        }

        if (!matchingPromoCode) {
            throw new NotFoundException('Promo code not found for this event');
        }

        const result = {
            promoCode: plainToInstance(PromoCode, matchingPromoCode, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        };

        if (!matchingPromoCode.isActive) {
            throw new UnprocessableEntityException("Promo code is not active");
            // throw new ImATeapotException("Promo code is not active");
        }

        return result;
    }

    async isValidPromoCode(dto: ValidatePromoCodeDto): Promise<boolean> {
        try {
            await this.validatePromoCode(dto);
            return true;
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
