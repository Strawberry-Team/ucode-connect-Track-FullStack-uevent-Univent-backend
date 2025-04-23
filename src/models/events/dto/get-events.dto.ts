// src/models/events/dto/get-events.dto.ts

import { EventFilterDto } from "./event-filter.dto";
import { WithPagination } from "../../../common/mixins/with-pagination.mixin";

export class GetEventsDto extends WithPagination(EventFilterDto) {}

// import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
// import { CreateEventDto } from './create-event.dto';
// import { IsArray, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
// import { Transform, Type } from 'class-transformer';
// import { EventStatus } from '@prisma/client';

// export class GetEventsDto extends PartialType(
//     PickType(CreateEventDto, [
//         'title',
//         'description',
//         'venue',
//         'startedAt',
//         'status', 
//         'companyId', 
//         'formatId',
//     ]
// )) {
//     @ApiProperty({
//         required: false,
//         description: 'Filter events by title',
//         type: 'string',
//         nullable: true,
//         example: 'Hackathon 2025'
//     })
//     title?: string;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by description',
//         type: 'string',
//         nullable: true,
//         example: 'Hackathon 2025'
//     })
//     description?: string;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by venue',
//         type: 'string',
//         nullable: true,
//         example: 'Kyiv'
//     })
//     venue?: string;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by start date',
//         type: 'string',
//         nullable: true,
//         example: '2025-05-01T00:00:00.000Z'
//     })
//     startedAt?: Date;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by status',
//         type: 'string',
//         nullable: true,
//         enum: EventStatus,
//         example: EventStatus.SALES_STARTED
//     })
//     status?: EventStatus;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by company identifier',
//         type: 'number',
//         nullable: true,
//         example: 1
//     })
//     companyId?: number;

//     @ApiProperty({
//         required: false,
//         description: 'Filter events by format identifier',
//         type: 'number',
//         nullable: true,
//         example: 1
//     })
//     formatId?: number;

//     @IsArray()
//     @IsPositive({ each: true })
//     @IsOptional()
//     @Transform(({ value }) => {
//         if (typeof value === 'string') {
//             return value.split(',').map(Number);
//         }
//         return value;
//     })
//     @ApiProperty({
//         required: false,
//         description: 'Event theme identifiers (comma-separated)',
//         nullable: true,
//         type: 'string',
//         example: '1,2,3',
//     })
//     themes?: number[];

//     @IsOptional()
//     @IsNumber()
//     @Min(0)
//     @Type(() => Number)
//     @ApiProperty({
//         required: false,
//         description: 'Minimum ticket price',
//         type: 'number',
//         nullable: true,
//         example: 199.99,
//     })
//     minPrice?: number;

//     @IsOptional()
//     @IsNumber()
//     @Min(0)
//     @Type(() => Number)
//     @ApiProperty({
//         required: false,
//         description: 'Maximum ticket price',
//         type: 'number',
//         nullable: true,
//         example: 499.99,
//     })
//     maxPrice?: number;
// }