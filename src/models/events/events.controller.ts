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
    NotImplementedException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { TicketsService } from '../tickets/tickets.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BaseCrudController } from '../../common/controller/base-crud.controller';
import { Event } from './entities/event.entity';
import { Public } from '../../common/decorators/public.decorator';
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiQuery,
} from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketStatus } from '@prisma/client';
import { FindAllTicketsQueryDto } from '../tickets/dto/find-all-tickets-query.dto';

@Controller('events')
@ApiTags('Events')
@ApiSecurity('JWT')
export class EventsController extends BaseCrudController<
    Event,
    CreateEventDto,
    UpdateEventDto
> {
    constructor(
        private readonly eventsService: EventsService,
        private readonly ticketsService: TicketsService,
    ) {
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

    @Post(':id/tickets')
    @ApiOperation({ summary: 'Create tickets for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event ID',
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
        @Param('id') id: string,
    ): Promise<Ticket[]> {
        const eventIdParsed = id ? parseInt(id, 10) : undefined;
        return this.ticketsService.createTickets(dto, eventIdParsed);
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
    @Get(':id/tickets')
    @ApiOperation({ summary: 'Get all tickets for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event ID',
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
                items: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
                total: { type: 'number', example: 10 },
            },
        },
    })
    async findAllTickets(
        @Param('id') id: string,
        @Query() query: FindAllTicketsQueryDto,
    ): Promise<{ items: Ticket[]; total: number }> {
        const eventIdParsed = id ? parseInt(id, 10) : undefined;
        return this.ticketsService.findAllTickets({
            eventId: eventIdParsed,
            ...query,
        });
    }

    @Public()
    @Get(':id/tickets/:ticketId')
    @ApiOperation({ summary: 'Get data of a specific ticket for an event' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Event ID',
        example: 1,
    })
    @ApiParam({
        name: 'ticketId',
        required: true,
        type: Number,
        description: 'Ticket ID',
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
        return this.ticketsService.findOneTicket(ticketId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update event data' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
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
        description: 'Event successfully updated',
        type: Event,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
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
        name: 'id',
        required: true,
        type: Number,
        description: 'Event ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Event successfully deleted',
    })
    async remove(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        return await super.remove(id, userId);
    }
}
