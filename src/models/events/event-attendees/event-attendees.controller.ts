// src/models/events/event-attendees/event-attendees.controller.ts
import { Controller, HttpStatus, Param, Patch, UseGuards, Body } from '@nestjs/common';
import { EventAttendeesService } from './event-attendees.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import { AttendeeGuard } from './guards/attendee.guard';
import { JwtAuthGuard } from 'src/models/auth/guards/auth.guards';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateEventAttendeeDto } from './dto/update-event-attendee.dto';
import { EventAttendee } from './entities/event-attendee.entities';

@Controller('event-attendees')
export class EventAttendeesController {
    constructor(private readonly eventAttendeesService: EventAttendeesService) {}

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AttendeeGuard)
    @ApiOperation({ summary: 'Update event attendee' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Attendee identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User visibility successfully updated',
        type: EventAttendee,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Unable to update an attendee',
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
                        'You are not authorized to access this event',
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
        description: 'Attendee not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Attendee not found',
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
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventAttendeeDto
    ) {
        return await this.eventAttendeesService.update(id, dto);
    }
}
