// src/models/promo-codes/hashing-promo-codes.service.ts
import { Injectable } from '@nestjs/common';
import { HashingService, HashType } from '../../common/services/hashing.service';

@Injectable()
export class HashingPromoCodesService {
    constructor(private hashingService: HashingService) {}

    async hash(promoCode: string): Promise<string> {
        return this.hashingService.hash(promoCode, HashType.PROMO_CODE);
    }

    async compare(
        plainPromoCode: string,
        hashedPromoCode: string,
    ): Promise<boolean> {
        return this.hashingService.compare(plainPromoCode, hashedPromoCode);
    }
}
