// src/models/companies/dto/company-filter.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { IsDescription } from "src/common/validators/description.validator";
import { IsName } from "src/common/validators/name.validator";

export class CompanyFilterDto {
    @IsOptional()
    @IsString()
    @ApiProperty({
        required: false,
        description: 'Filter companies by email',
        type: 'string',
        nullable: false,
        example: 'open',
    })
    email?: string;

    @IsDescription(true)
    @ApiProperty({
        required: false,
        description: 'Filter companies by title',
        type: 'string',
        nullable: true,
        example: 'open',
    })
    title?: string;

    @IsName(true)
    @ApiProperty({
        required: false,
        description: 'Filter companies by description',
        type: 'string',
        nullable: true,
        example: 'user',
    })
    description?: string;
} 