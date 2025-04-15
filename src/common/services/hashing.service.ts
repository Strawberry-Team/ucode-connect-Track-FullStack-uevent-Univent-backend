// src/common/services/hashing.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

export enum HashType {
    PASSWORD = 'password',
    PROMO_CODE = 'promoCode'
}

@Injectable()
export class HashingService {
    private readonly saltRoundsConfig: Record<HashType, number>;

    constructor(private configService: ConfigService) {
        this.saltRoundsConfig = {
            [HashType.PASSWORD]: Number(
                this.configService.get<number>('app.passwordSaltRounds')
            ),
            [HashType.PROMO_CODE]: Number(
                this.configService.get<number>('app.promoCodeSaltRounds')
            )
        };
    }

    async hash(plainText: string, type: HashType): Promise<string> {
        return bcrypt.hash(plainText, this.saltRoundsConfig[type]);
    }

    async compare(
        plainText: string,
        hashedText: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainText, hashedText);
    }
}
