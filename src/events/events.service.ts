import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { Event, SERIALIZATION_GROUPS } from './entities/events.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(private readonly eventsRepository: EventsRepository) {}

    async createEvent(eventDto: CreateEventDto): Promise<Event> {
        const event = {
            ...eventDto
        }

        return this.eventsRepository.create(event);
    }

    async findById(id: number): Promise<Event> {
        const event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findByCompanyId(companyId: number): Promise<Event[]> {
        return this.eventsRepository.findByCompanyId(companyId);
    }

    async updateEvent(id: number, eventDto: UpdateEventDto): Promise<Event> {
        const event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        
        const updatedEvent = {
            ...event,
            ...eventDto,
        }
        
        return this.eventsRepository.update(id, updatedEvent);
    }

    async deleteEvent(id: number): Promise<void> {
        const event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        
        return this.eventsRepository.delete(id);
    }

    async findAllEvents(): Promise<Event[]> {
        return this.eventsRepository.findAll();
    }
}
