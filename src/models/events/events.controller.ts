import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Patch,
    Delete,
    HttpStatus,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { TicketsService } from '../tickets/tickets.service';
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
    ApiTags,
    ApiQuery, ApiExtraModels,
} from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketStatus } from '@prisma/client';
import { FindAllTicketsQueryDto } from '../tickets/dto/find-all-tickets-query.dto';
import { CreateEventThemesDto } from './dto/create-event-themes.dto';
import { CreateNewsDto } from '../news/dto/create-news.dto';
import { NewsService } from '../news/news.service';
import { createFileUploadInterceptor } from '../../common/interceptor/file-upload.interceptor';
import { AvatarConfig } from '../../config/avatar.config';
import { Express } from 'express';
import { EventNewsDto } from '../news/dto/event-news.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { EventAttendeesService } from './event-attendees/event-attendees.service';
import { EventAttendee } from './event-attendees/entities/event-attendee.entities';
import { CreatePromoCodeDto } from '../promo-codes/dto/create-promo-code.dto';
import {
    PromoCode,
    PromoCodeWithBasic,
} from '../promo-codes/entities/promo-code.entity';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { getSchemaPath } from '@nestjs/swagger';

@ApiExtraModels(PromoCodeWithBasic)
@Controller('events')
@ApiTags('Events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly newsService: NewsService,
        private readonly ticketsService: TicketsService,
        private readonly eventAttendeesService: EventAttendeesService,
        private readonly promoCodesService: PromoCodesService,
    ) {}

    @Post()
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

    @Post(':id/news')
    @ApiOperation({
        summary: 'Create event news item',
    })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
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
        @Param('id') id: number,
        @Body() dto: CreateNewsDto,
        @UserId() userId: number,
    ) {
        return await this.newsService.create(dto, userId, undefined, id);
    }

    @Post(':id/tickets')
    @ApiOperation({ summary: 'Create tickets for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiBody({
        type: CreateTicketDto,
        description: 'Ticket creation data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tickets successfully created',
        isArray: true,
        type: Ticket,
    })
    async createTicket(
        @Body() dto: CreateTicketDto,
        @Param('id') id: number,
    ): Promise<Ticket[]> {
        // const eventIdParsed = id ? parseInt(id, 10) : undefined;
        return await this.ticketsService.createTickets(dto, id);
    }

    @Post(':id/promo-codes')
    @ApiOperation({ summary: 'Create promo codes for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiBody({
        type: CreatePromoCodeDto,
        description: 'Promo code creation data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Promo code successfully created',
        type: PromoCode,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error messages',
                    example: [
                        'discountPercent must be a number conforming to the specified constraints',
                        'discountPercent must not be less than 0',
                        'discountPercent must not be greater than 1',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'HTTP status code',
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
        status: HttpStatus.CONFLICT,
        description: 'Promo code already exists',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example:
                        'Promo code with this code already exists for this event',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Conflict',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 409,
                },
            },
        },
    })
    async createPromoCode(
        @Body() dto: CreatePromoCodeDto,
        @Param('id') id: number,
    ): Promise<PromoCode> {
        return await this.promoCodesService.create(dto, id);
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

    @Get(':id/news')
    @Public()
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
        example: 1,
    })
    @ApiOperation({ summary: 'Get all event news' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of event news',
        type: [EventNewsDto],
    })
    async findAllNews(@Param('id') id: number) {
        return await this.newsService.findByEventId(id);
    }

    @Get(':id/tickets')
    @Public()
    @ApiOperation({ summary: 'Get all tickets for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiQuery({
        name: 'title',
        required: false,
        description: 'Filter tickets by title',
        type: String,
        example: 'VIP Ticket',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter tickets by status',
        enum: TicketStatus,
        example: TicketStatus.AVAILABLE,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tickets retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Ticket' },
                },
                total: { type: 'number', example: 10 },
            },
        },
    })
    async findAllTickets(
        @Param('id') id: number,
        @Query() query: FindAllTicketsQueryDto,
    ): Promise<{ items: Ticket[]; total: number }> {
        // const eventIdParsed = id ? parseInt(id, 10) : undefined;
        return await this.ticketsService.findAllTickets({
            eventId: id,
            ...query,
        });
    }

    @Get(':id/promo-codes')
    @ApiOperation({ summary: 'Get all promo codes for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Promo codes retrieved successfully',
        type: [PromoCode],
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
    async findAllPromoCodes(@Param('id') id: number): Promise<PromoCode[]> {
        return await this.promoCodesService.findAllByEventId(id);
    }

    @Get(':id/tickets/:ticketId')
    @Public()
    @ApiOperation({ summary: 'Get data of a specific ticket for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiParam({
        name: 'ticketId',
        required: true,
        type: Number,
        description: 'Ticket identifier',
        example: 123,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Ticket retrieved successfully',
        type: Ticket,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Ticket not found',
    })
    async findOneTicket(
        @Param('id') id: number,
        @Param('ticketId') ticketId: number,
    ): Promise<Ticket> {
        return await this.ticketsService.findOneTicket(ticketId, id);
    }

    @Get(':id/promo-codes/code/:code')
    @ApiOperation({ summary: 'Get promo code by event ID and code' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiParam({
        name: 'code',
        required: true,
        type: String,
        description: 'Promo code',
        example: 'SUMMER2023',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Promo code retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                promoCode: { $ref: getSchemaPath(PromoCodeWithBasic) }, //TODO: подумать, как лучше сделать
                explanationMessage: {
                    type: 'string',
                    example: 'Promo code is not active',
                },
            },
            required: ['promoCode'],
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Promo code not found of this event',
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
    async findOnePromoCode(
        @Param('id') id: number,
        @Param('code') code: string,
    ): Promise<{
        promoCode: PromoCodeWithBasic;
        explanationMessage?: string;
    }> {
        return await this.promoCodesService.findOneByEventIdAndCode(id, code);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get event data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
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

    @Patch(':id')
    @ApiOperation({ summary: 'Update event data' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateEventDto,
        description: 'Event update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Event successfully updated',
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
        description: 'Event identifier',
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

    @Post(':id/themes')
    @ApiOperation({ summary: 'Sync event themes' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: CreateEventThemesDto,
        description: 'Event themes',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Event themes successfully synced',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
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
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Event not found',
    })
    async syncThemes(
        @Param('id') id: number,
        @Body() dto: CreateEventThemesDto,
    ): Promise<void> {
        return await this.eventsService.syncThemes(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Event deletion' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully deletion',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Unable to delete an event with existing tickets',
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
    async delete(@Param('id') id: number) {
        return await this.eventsService.delete(id);
    }

    @Get(':id/attendees')
    @Public()
    @ApiOperation({ summary: 'Get event attendees' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Event attendees successfully retrieved',
        type: [EventAttendee],
    })
    async getEventAttendees(@Param('id') id: number, @UserId() userId: number | null) {
        return await this.eventAttendeesService.getEventAttendees(id, userId);
    }
}
