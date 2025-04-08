import { IsEmail } from '../../common/validators/email.validator';
import { IsTitle } from '../../common/validators/title.validator';
import { IsDescription } from '../../common/validators/description.validator';
import { IsId } from '../../common/validators/id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateCompanyDto {
    @IsId(false)
    @ApiProperty({
        required: true,
        description: 'Company identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    ownerId: number;

    @IsEmail(false)
    @ApiProperty({
        required: true,
        description: 'Company email',
        nullable: false,
        type: 'string',
        example: 'support@google.com',
    })
    email: string;

    @IsTitle(false)
    @ApiProperty({
        required: true,
        description: 'Company name',
        nullable: false,
        type: 'string',
        example: 'Google',
    })
    title: string;

    @IsOptional()
    @IsDescription(true)
    @ApiProperty({
        required: false,
        description: 'Company description',
        nullable: false,
        type: 'string',
        example: `Google LLC is an American multinational corporation and technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, consumer electronics, and artificial intelligence (AI). It has been referred to as "the most powerful company in the world" by the BBC and is one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the field of AI. Alongside Amazon, Apple, Meta, and Microsoft, Google's parent company, Alphabet Inc. is one of the five Big Tech companies.`
    })
    description?: string;
}
