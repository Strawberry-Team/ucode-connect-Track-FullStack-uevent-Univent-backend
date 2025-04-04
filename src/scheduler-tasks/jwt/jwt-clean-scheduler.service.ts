// src/scheduler-tasks/jwt/jwt-clean-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { RefreshTokenNonceService } from 'src/refresh-token-nonce/refresh-token-nonce.service';
import { ConfigService } from '@nestjs/config';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { SchedulerConfig } from 'src/config/scheduler.config';
import { RefreshTokenNonce } from 'src/refresh-token-nonce/entity/refresh-token-nonce.entity';

@Injectable()
export class JwtCleanSchedulerService {
    constructor(
        private readonly refreshTokenNonceService: RefreshTokenNonceService,
        private configService: ConfigService,
    ) {
    }

    @Cron(SchedulerConfig.prototype.cleanRefreshTokensFromDb)
    @Timeout(10000)
    async cleanRefreshTokensFromDb() {
        const expirationTime = convertToSeconds((String(this.configService.get<string>(`jwt.expiresIn.refresh`))));
        const nonces: RefreshTokenNonce[] = await this.refreshTokenNonceService.getAll(expirationTime);

        if (nonces.length > 0) {
            await Promise.all(nonces.map(nonce =>
                this.refreshTokenNonceService.deleteRefreshTokenNonceByNonceId(nonce.id)
            ));
        }
    }
}
