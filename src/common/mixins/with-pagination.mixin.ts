// src/common/mixins/with-pagination.mixin.ts
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export type Constructor<T = any> = new (...args: any[]) => T;

export function WithPagination<TBase extends Constructor>(Base: TBase) {
    class PaginationMixin extends Base {
        @ApiProperty({
            required: false,
            description: 'Number of items to skip',
            type: 'number',
            minimum: 0,
        })
        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(0)
        skip?: number;

        @ApiProperty({
            required: false,
            description: 'Number of items to take',
            type: 'number',
            minimum: 1,
        })
        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(1)
        take?: number;
    }

    return PaginationMixin;
} 