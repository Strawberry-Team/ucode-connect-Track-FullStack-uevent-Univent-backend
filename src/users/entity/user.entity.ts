// src/users/entity/users.entity.ts
import {
    User as PrismaUser,
    RefreshTokenNonce as PrismaRefreshTokenNonce,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
    SYSTEMIC: ['basic','confidential','systemic'],
};

export class User implements PrismaUser {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['confidential'] })
    password: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'First name',
        nullable: false,
        type: 'string',
        example: 'Ann',
    })
    firstName: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName: string | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Profile picture',
        nullable: false,
        type: 'string',
        example: 'ann-nichols-avatar.png',
    })
    profilePictureName: string;

    @Expose({ groups: ['confidential'] })
    isEmailVerified: boolean;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Creation date',
        nullable: false,
        type: 'string',
        example: '2025-04-08T05:54:45.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['confidential'] })
    refreshTokenNonces?: PrismaRefreshTokenNonce[];
}
