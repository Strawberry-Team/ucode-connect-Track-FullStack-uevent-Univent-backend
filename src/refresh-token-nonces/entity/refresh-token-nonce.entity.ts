// src/refresh-token-nonces/entity/refresh-token-nonces.entity.ts
import { RefreshTokenNonce as PrismaRefreshTokenNonce } from '@prisma/client';
import { User } from '../../users/entity/user.entity';

export class RefreshTokenNonce implements PrismaRefreshTokenNonce {
    id: number;
    userId: number;
    nonce: string;
    createdAt: Date;

    // Optional relation property - not part of the Prisma model but useful for TypeScript
    user?: User;
}
