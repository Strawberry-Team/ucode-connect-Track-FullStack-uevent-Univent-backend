// scr/models/companies/entities/company.entity.ts
import { Company as PrismaCompany } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    NEWS: ['news'],
    SYSTEMIC: ['basic', 'systemic'],
};

export class Company implements PrismaCompany {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company identifier',
        required: true,
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company owner identifier',
        required: true,
        nullable: false,
        type: 'number',
        example: 1,
    })
    ownerId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company email',
        required: true,
        nullable: false,
        type: 'string',
        example: 'support@google.com',
    })
    email: string;

    @Expose({ groups: ['basic', 'news'] })
    @ApiProperty({
        description: 'Company name',
        required: true,
        nullable: false,
        type: 'string',
        example: 'Google',
    })
    title: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company description',
        required: true,
        nullable: false,
        type: 'string',
        example: `Google LLC is an American multinational corporation and technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, consumer electronics, and artificial intelligence (AI). It has been referred to as "the most powerful company in the world" by the BBC and is one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the field of AI. Alongside Amazon, Apple, Meta, and Microsoft, Google's parent company, Alphabet Inc. is one of the five Big Tech companies.`,
    })
    description: string;

    @Expose({ groups: ['basic', 'news'] })
    @ApiProperty({
        description: 'Company logo name',
        required: true,
        nullable: false,
        type: 'string',
        example: 'google-logo.png',
        default: 'default-logo.png',
    })
    logoName: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company registration date',
        required: true,
        nullable: false,
        type: 'string',
        example: '2025-04-08T08:54:45.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company owner data',
        required: false,
        nullable: false,
        type: User,
        example: User,
    })
    owner?: User;
}
