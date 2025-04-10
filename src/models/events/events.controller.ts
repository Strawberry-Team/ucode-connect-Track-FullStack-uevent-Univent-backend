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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BaseCrudController } from '../../common/controller/base-crud.controller';
import { Event } from './entities/event.entity';
import { Public } from '../../common/decorators/public.decorator';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorator';

@Controller('events')
@ApiTags('Events')
@ApiSecurity('JWT')
export class EventsController extends BaseCrudController<
    Event,
    CreateEventDto,
    UpdateEventDto
> {
    constructor(private readonly eventsService: EventsService) {
        super();
    }

    protected async createEntity(
        dto: CreateEventDto,
        userId: number,
    ): Promise<Event> {
        return this.eventsService.createEvent(dto);
    }

    protected async findById(id: number, userId: number): Promise<Event> {
        return this.eventsService.findEventById(id);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateEventDto,
        userId: number,
    ): Promise<Event> {
        return this.eventsService.updateEvent(id, dto);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        return this.eventsService.deleteEvent(id);
    }

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
        status: HttpStatus.NOT_FOUND,
        description: 'Company not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Company not found',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Event data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event with this title already exists',
                },
            },
        },
    })
    async create(
        @Body() dto: CreateEventDto,
        @UserId() userId: number,
    ): Promise<Event> {
        return await super.create(dto, userId);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all events data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of events',
        type: [Event],
    })
    async findAll(): Promise<Event[]> {
        return this.eventsService.findAllEvents();
    }

    @Public()
    @Get(':id')
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
    async findOne(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<Event> {
        // TODO: Треба зробити по нормальному userId
        return await super.findOne(id, 0);
    }

    @Patch(':id')
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
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Event data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event with this title already exists',
                },
            },
        },
    })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventDto,
        @UserId() userId: number,
    ): Promise<Event> {
        return await super.update(id, dto, userId);
    }

    @Delete(':id')
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
                    example: 'Event can be deleted only by its owner',
                },
            },
        },
    })
    async remove(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        return await super.remove(id, userId);
    }
}
