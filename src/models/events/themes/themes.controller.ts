// src/models/events/themes/themes.controller.ts
import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { EventTheme } from './entities/theme.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('themes')
@ApiTags('Themes')
export class ThemesController {
    constructor(private readonly themesService: ThemesService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all themes' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of themes',
        type: [EventTheme],
    })
    async findAll(): Promise<EventTheme[]> {
        return this.themesService.findAll();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get theme data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Theme ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: EventTheme,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Theme not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Theme not found',
                },
            },
        },
    })
    async findOne(@Param('id') id: number): Promise<EventTheme> {
        return this.themesService.findById(id);
    }
}