// src/jobs/jwt-clean-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { RefreshTokenNoncesService } from 'src/models/refresh-token-nonces/refresh-token-nonces.service';
import { ConfigService } from '@nestjs/config';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { SchedulerConfig } from 'src/config/scheduler.config';
import { RefreshTokenNonce } from 'src/models/refresh-token-nonces/entities/refresh-token-nonce.entity';

@Injectable()
export class JwtCleanSchedulerService {
    constructor(
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
        private configService: ConfigService,
    ) {}

    @Cron(SchedulerConfig.prototype.cleanRefreshTokensFromDb)
    @Timeout(10000)
    async cleanRefreshTokensFromDb() {
        const expirationTime = convertToSeconds(
            String(this.configService.get<string>(`jwt.expiresIn.refresh`)),
        );
        const nonces: RefreshTokenNonce[] =
            await this.refreshTokenNonceService.findAllRefreshTokenNonces(expirationTime);

        if (nonces.length > 0) {
            await Promise.all(
                nonces.map((nonce) =>
                    this.refreshTokenNonceService.deleteRefreshTokenNonceById(
                        nonce.id,
                    ),
                ),
            );
        }
    }
}
