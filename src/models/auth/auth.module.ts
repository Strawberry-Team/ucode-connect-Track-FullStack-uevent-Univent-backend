// src/models/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtResetPasswordStrategy } from './strategies/jwt-reset-password.strategy';
import { JwtConfirmEmailStrategy } from './strategies/jwt-confirm-email.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshTokenNoncesModule } from 'src/models/refresh-token-nonces/refresh-token-nonces.module';
import {
    JwtAuthGuard,
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard,
} from 'src/models/auth/guards/auth.guards';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
        UsersModule,
        EmailModule,
        forwardRef(() => RefreshTokenNoncesModule),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAccessStrategy,
        JwtResetPasswordStrategy,
        JwtConfirmEmailStrategy,
        JwtRefreshStrategy,
        JwtAuthGuard,
        JwtRefreshGuard,
        JwtResetPasswordGuard,
        JwtConfirmEmailGuard,
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
