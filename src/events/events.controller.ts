import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { Event } from './entities/events.entity';
import { Public } from '../common/decorators/public.decorator';

@Controller('events')
export class EventsController extends BaseCrudController<Event, CreateEventDto, UpdateEventDto> {
    constructor(private readonly eventsService: EventsService) {
        super();
    }

    @Public()
    @Get()
    async findAll(): Promise<Event[]> {
        return this.eventsService.findAllEvents();
    }
    
    async findById(id: number): Promise<Event> {
        return this.eventsService.findById(id);
    }

    async createEntity(dto: CreateEventDto): Promise<Event> {
        return this.eventsService.createEvent(dto);
    }

    async updateEntity(id: number, dto: UpdateEventDto): Promise<Event> {
        return this.eventsService.updateEvent(id, dto);
    }

    async deleteEntity(id: number): Promise<void> {
        return this.eventsService.deleteEvent(id);
    }

    @Public()
    @Get(':id')
    async getById(@Param('id') id: number): Promise<Event> {
        // TODO: Треба зробити по нормальному userId
        return await super.getById(id, 0);
    }
}