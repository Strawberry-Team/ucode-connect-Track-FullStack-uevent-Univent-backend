// src/user/entity/user.entity.ts
import { User as PrismaUser, RefreshTokenNonce as PrismaRefreshTokenNonce } from '@prisma/client';
import { Expose } from 'class-transformer';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
};

export class User implements PrismaUser {
    @Expose({ groups: ['basic'] })
    id: number;

    @Expose({ groups: ['confidential'] })
    password: string;

    @Expose({ groups: ['basic'] })
    firstName: string;

    @Expose({ groups: ['basic'] })
    lastName: string | null;

    @Expose({ groups: ['basic'] })
    email: string;

    @Expose({ groups: ['basic'] })
    profilePictureName: string;

    @Expose({ groups: ['confidential'] })
    isEmailVerified: boolean;

    @Expose({ groups: ['basic'] })
    createdAt: Date;

    @Expose({ groups: ['basic'] })
    updatedAt: Date;

    @Expose({ groups: ['confidential'] })
    refreshTokenNonces?: PrismaRefreshTokenNonce[];
}
