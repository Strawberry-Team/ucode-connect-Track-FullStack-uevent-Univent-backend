// src/models/events/formats/formats.controller.ts
import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { EventFormatsService } from './event-formats.service';
import { EventFormat } from './entities/event-format.entity';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('formats')
@ApiTags('Formats')
export class EventFormatsController {
    constructor(private readonly formatsService: EventFormatsService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all formats' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of formats',
        type: [EventFormat],
    })
    async findAll(): Promise<EventFormat[]> {
        return this.formatsService.findAll();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get format data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Format ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: EventFormat,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Format not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Format not found',
                },
            },
        },
    })
    async findOne(@Param('id') id: number): Promise<EventFormat> {
        return this.formatsService.findById(id);
    }
}
