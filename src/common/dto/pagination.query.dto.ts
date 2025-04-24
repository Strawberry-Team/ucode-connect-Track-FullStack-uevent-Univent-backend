// src/common/dto/pagination.query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
    @ApiProperty({
        required: false,
        description: 'Number of items to skip',
        type: 'number',
        minimum: 0,
        default: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number = 0;

    @ApiProperty({
        required: false,
        description: 'Number of items to take',
        type: 'number',
        minimum: 1,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    take?: number = 10;
} 