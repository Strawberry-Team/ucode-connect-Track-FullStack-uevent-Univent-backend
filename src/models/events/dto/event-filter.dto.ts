// src/models/events/dto/get-events.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EventStatus } from '@prisma/client';
import { IsName } from 'src/common/validators/name.validator';
import { IsDescription } from 'src/common/validators/description.validator';
import { IsISO8601Date } from 'src/common/validators/date.validator';
import { IsId } from 'src/common/validators/id.validator';
import { IsEnumArray } from 'src/common/validators/enum-array.validator';

export class EventFilterDto {
    @IsName(true)
    @ApiProperty({
        required: false,
        description: 'Filter events by title',
        type: 'string',
        nullable: true,
        example: 'Hackathon 2025'
    })
    title?: string;

    @IsDescription(true)
    @ApiProperty({
        required: false,
        description: 'Filter events by description',
        type: 'string',
        nullable: true,
        example: 'Hackathon 2025'
    })
    description?: string;

    @IsName(true)
    @ApiProperty({
        required: false,
        description: 'Filter events by venue',
        type: 'string',
        nullable: true,
        example: 'Kyiv'
    })
    venue?: string;

    @IsISO8601Date(true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Filter events by start date',
        type: 'string',
        nullable: true,
        example: '2025-05-01T00:00:00.000Z'
    })
    startedAt?: Date;

    @IsISO8601Date(true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Filter events by end date',
        type: 'string',
        nullable: true,
        example: '2025-05-20T00:00:00.000Z'
    })
    endedAt?: Date;

    @IsOptional()
    @IsEnumArray(EventStatus)
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',');
        }
        return value;
    })
    @ApiProperty({
        required: false,
        description: 'Filter events by status (comma-separated)',
        type: 'array',
        items: {
            type: 'string',
            enum: Object.values(EventStatus)
        },
        nullable: true,
        example: `${EventStatus.PUBLISHED},${EventStatus.SALES_STARTED},${EventStatus.ONGOING}`
    })
    status?: EventStatus[];

    @IsId(true)
    @ApiProperty({
        required: false,
        description: 'Filter events by company identifier',
        type: 'number',
        nullable: true,
        example: 1
    })
    companyId?: number;

    @IsArray()
    @IsPositive({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(Number);
        }
        return value;
    })
    @ApiProperty({
        required: false,
        description: 'Event format identifiers (comma-separated)',
        nullable: true,
        type: 'string',
        example: '1,2,3',
    })
    formats?: number[];

    @IsArray()
    @IsPositive({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(Number);
        }
        return value;
    })
    @ApiProperty({
        required: false,
        description: 'Event theme identifiers (comma-separated)',
        nullable: true,
        type: 'string',
        example: '1,2,3',
    })
    themes?: number[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({
        required: false,
        description: 'Minimum ticket price',
        type: 'number',
        nullable: true,
        example: 199.99,
    })
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({
        required: false,
        description: 'Maximum ticket price',
        type: 'number',
        nullable: true,
        example: 499.99,
    })
    maxPrice?: number;
}
