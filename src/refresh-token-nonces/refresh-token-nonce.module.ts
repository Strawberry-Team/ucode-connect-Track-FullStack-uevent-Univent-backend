// src/refresh-token-nonces/refresh-token-nonces.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokenNonceService } from './refresh-token-nonce.service';
import { RefreshTokenNonceRepository } from './refresh-token-nonce.repository';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { NonceUtils } from '../common/utils/nonce.utils';
import { RefreshTokenNonce } from './entity/refresh-token-nonce.entity';

@Module({
    imports: [
        JwtModule.register({}),
        forwardRef(() => AuthModule),
        UsersModule,
    ],
    providers: [
        RefreshTokenNonceService,
        RefreshTokenNonceRepository,
        NonceUtils,
    ],
    exports: [RefreshTokenNonceService, NonceUtils],
})
export class RefreshTokenNonceModule {}
