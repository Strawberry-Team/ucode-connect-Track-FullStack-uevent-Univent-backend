// src/models/events/dto/create-event-themes.dto.ts

import { IsArray, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EventThemeDto {
    @IsNumber()
    @ApiProperty({
        description: 'Theme identifier',
        example: 1,
        type: Number
    })
    id: number;
}

export class CreateEventThemesDto {
    @IsArray()
    @ArrayMinSize(0)
    @ValidateNested({ each: true })
    @Type(() => EventThemeDto)
    @ApiProperty({
        description: 'Array of event themes',
        type: [EventThemeDto],
        example: [{ id: 1 }, { id: 2 }]
    })
    themes: EventThemeDto[];
}
