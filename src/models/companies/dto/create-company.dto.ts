// src/models/companies/dto/create-company.dto.ts
import { IsEmail } from '../../../common/validators/email.validator';
import { IsName } from '../../../common/validators/name.validator';
import { IsDescription } from '../../../common/validators/description.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
    @IsEmail(false)
    @ApiProperty({
        required: true,
        description: 'Company email',
        nullable: false,
        type: 'string',
        example: 'support@google.com',
    })
    email: string;

    @IsName(false)
    @ApiProperty({
        required: true,
        description: 'Company name',
        nullable: false,
        type: 'string',
        example: 'Google',
    })
    title: string;

    @IsDescription(true)
    @ApiProperty({
        required: false,
        description: 'Company description',
        nullable: false,
        type: 'string',
        example: `Google LLC is an American multinational corporation and technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, consumer electronics, and artificial intelligence (AI). It has been referred to as "the most powerful company in the world" by the BBC and is one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the field of AI. Alongside Amazon, Apple, Meta, and Microsoft, Google's parent company, Alphabet Inc. is one of the five Big Tech companies.`,
    })
    description?: string;
}
