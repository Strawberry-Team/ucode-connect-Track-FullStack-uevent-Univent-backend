// src/models/news/news.controller.ts
import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CompanyNewsDto } from './dto/company-news.dto';
import { EventNewsDto } from './dto/event-news.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { NewsOwnerGuard } from './guards/news-owner.guard';

@Controller('news')
@ApiTags('News')
@UseGuards(JwtAuthGuard)
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get news item by id' })
    @ApiParam({
        name: 'id',
        required: true,
        type: 'number',
        description: 'News item identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: CompanyNewsDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'News item not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News item not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    async findOne(@Param('id') id: number) {
        return await this.newsService.findById(id);
    }

    @Patch(':id')
    @UseGuards(NewsOwnerGuard)
    @ApiOperation({ summary: 'Update news data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'News identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateNewsDto,
        description: 'News update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully update',
        type: EventNewsDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'title must be shorter than or equal to 100 characters',
                        'description must be shorter than or equal to 1000 characters',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                status: {
                    type: 'number',
                    description: 'Error message',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Only the news owner has access to it',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'News not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    async update(@Param('id') id: number, @Body() dto: UpdateNewsDto) {
        return await this.newsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(NewsOwnerGuard)
    @ApiOperation({ summary: 'News item deletion' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'News identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully deletion',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'News item successfully deleted',
                }
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'title must be shorter than or equal to 100 characters',
                        'description must be shorter than or equal to 1000 characters',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                status: {
                    type: 'number',
                    description: 'Error message',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Only the news owner has access to it',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'News not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    async delete(@Param('id') id: number) {
        return await this.newsService.delete(id);
    }
}
