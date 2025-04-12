// src/models/events/events.controller.ts
import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Patch,
    Delete,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { Public } from '../../common/decorators/public.decorator';
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateNewsDto } from '../news/dto/create-news.dto';
import { NewsService } from '../news/news.service';
import { CompanyOwnerGuard } from '../companies/guards/company-owner.guard';
import { createFileUploadInterceptor } from '../../common/interceptor/file-upload.interceptor';
import { AvatarConfig } from '../../config/avatar.config';
import { Express } from 'express';
import { EventNewsDto } from '../news/dto/event-news.dto';

@Controller('events')
@ApiTags('Events')
@ApiSecurity('JWT')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly newsService: NewsService,
    ) {}

    @Post()
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Event creation' })
    @ApiBody({
        required: true,
        type: CreateEventDto,
        description: 'Event registration data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful event registration',
        type: Event,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event title must be not empty',
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
                    example: 'Invalid or expired refresh token',
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
                    example:
                        'Only the company owner has access to create event',
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
    async create(@Body() dto: CreateEventDto): Promise<Event> {
        return await this.eventsService.create(dto);
    }

    @Post(':event_id/news')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({
        summary: 'Create event news item',
    })
    @ApiParam({
        required: true,
        name: 'event_id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: CreateNewsDto,
        description: 'Data for news creation',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully creation',
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
                        'email must be an email',
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
                    example:
                        'Only the company owner has access to create event news',
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
        description: 'Event not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event not found',
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
    async createNews(
        @Param('event_id') eventId: number,
        @Body() dto: CreateNewsDto,
        @UserId() userId: number,
    ) {
        return await this.newsService.create(dto, userId, undefined, eventId);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all events data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of events',
        type: [Event],
    })
    async findAll(): Promise<Event[]> {
        return await this.eventsService.findAll();
    }

    @Get(':event_id/news')
    @Public()
    @ApiParam({
        required: true,
        name: 'event_id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiOperation({ summary: 'Get all event news' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of event news',
        type: [EventNewsDto],
    })
    async findAllNews(@Param('event_id') eventId: number) {
        return await this.newsService.findByEventId(eventId);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get event data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: Event,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Event not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event not found',
                },
            },
        },
    })
    async findOne(@Param('id') id: number): Promise<Event> {
        // TODO: Треба зробити по нормальному userId
        return await this.eventsService.findById(id);
    }

    @Get(':event_id/news/:news_id')
    @Public()
    @ApiOperation({ summary: 'Get event news item by id' })
    @ApiParam({
        required: true,
        name: 'event_id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiParam({
        required: true,
        name: 'news_id',
        type: 'number',
        description: 'News ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: EventNewsDto,
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
    async findOneNews(@Param('id') id: number) {
        const event = await this.eventsService.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return await this.newsService.findById(id);
    }

    @Patch(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Update event data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateEventDto,
        description: 'Event update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Event,
        description: 'Successfully update',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event title must be not empty',
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
                    example: 'Event data can be updated only by its owner',
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
                    example:
                        'Only the company owner has access to update event',
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
        description: 'Event not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event not found',
                },
            },
        },
    })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventDto,
    ): Promise<Event> {
        return await this.eventsService.update(id, dto);
    }

    @Post(':id/upload-poster')
    @UseGuards(CompanyOwnerGuard)
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/event-posters',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        }),
    )
    @ApiOperation({ summary: 'Upload event poster' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Poster image file (e.g., PNG, JPEG). Example: "poster.png" (max size: 5MB)',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Poster successfully uploaded',
        schema: {
            type: 'object',
            properties: {
                server_filename: {
                    type: 'string',
                    description: 'Filename for the uploaded poster',
                    example: '885dac20-7f0c-42c7-aa7d-e820a9315418.jpg',
                },
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
                    type: 'string',
                    example: 'Invalid file format or missing file',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
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
        description: 'Forbidden access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example:
                        'Only the company owner has access to upload event poster',
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
        description: 'Event not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event not found',
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
    async updatePoster(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        if (!file) {
            throw new BadRequestException(
                'Invalid file format or missing file',
            );
        }

        await this.eventsService.updatePoster(id, file.filename);

        return { server_filename: file.filename };
    }

    @Delete(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Delete event' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Event successfully deleted',
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
                    example:
                        'Only the company owner has access to delete event',
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
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event can be deleted only by its owner',
                },
            },
        },
    })
    async delete(@Param('id') id: number): Promise<void> {
        return await this.eventsService.delete(id);
    }
}
