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
import { CreateEventThemesDto } from './dto/create-event-themes.dto';

@Controller('events')
@ApiTags('Events')
@ApiSecurity('JWT')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}
  
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
    async create(
        @Body() dto: CreateEventDto,
        @UserId() userId: number,
    ): Promise<Event> {
        return this.eventsService.create(dto);
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
        return this.eventsService.findAll();
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
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventDto,
        @UserId() userId: number,
    ): Promise<Event> {
        return this.eventsService.update(id, dto);
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
        return this.eventsService.delete(id);
    }

    @Post(':id/themes')
    @ApiOperation({ summary: 'Sync event themes' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Event ID',
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
}
