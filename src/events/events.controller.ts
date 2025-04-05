import { Controller, Get, Param, Post, Body, Patch, Delete, ValidationPipe, UsePipes } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Get()
    async findAll() {
        return this.eventsService.findAllEvents();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.eventsService.findById(id);
    }

    @Post()
    async create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.createEvent(createEventDto);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateEventDto: UpdateEventDto) {
        return this.eventsService.updateEvent(id, updateEventDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.eventsService.deleteEvent(id);
    }
    
    
    
}