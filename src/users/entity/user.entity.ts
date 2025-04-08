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
    @ApiProperty({
        description: 'Password',
        nullable: false,
        type: 'string',
        example: '$2b$10$CBNslw0CIFUyTa.Z5E0mi.413uM0XyHvQy33f8scK/4Zq5TBmecA6',
    })
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
    @ApiProperty({
        description: 'User email verification status',
        nullable: false,
        type: 'boolean',
        example: true,
    })
    isEmailVerified: boolean;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Creation date',
        nullable: false,
        type: 'string',
        example: '2025-04-08T05:54:45.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Update date',
        nullable: false,
        type: 'string',
        example: '2025-04-08T05:54:45.000Z',
    })
    updatedAt: Date;

    @Expose({ groups: ['confidential'] })
    @ApiProperty({
        description: 'Refresh token nonces',
        nullable: true,
        type: 'array',
        example: [
            {
                id: 1,
                nonce: 'abc123xyz789',
                userId: 1,
                createdAt: '2025-04-08T05:54:45.000Z',
            },
            {
                id: 2,
                nonce: 'def456uvw012',
                userId: 1,
                createdAt: '2025-04-08T05:54:45.000Z',
            },
        ],
    })
    refreshTokenNonces?: PrismaRefreshTokenNonce[];
}
