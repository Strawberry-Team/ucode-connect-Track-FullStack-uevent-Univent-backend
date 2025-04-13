// src/models/events/events.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { Event, EventWithRelations, SERIALIZATION_GROUPS } from './entities/event.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventThemesDto } from './dto/create-event-themes.dto';

@Injectable()
export class EventsService {
    constructor(private readonly eventsRepository: EventsRepository) {}

    async create(eventDto: CreateEventDto): Promise<Event> {
        const event = await this.eventsRepository.create(eventDto);
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findAll(): Promise<EventWithRelations[]> {
        const events = await this.eventsRepository.findAll();
        return plainToInstance(Event, events, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findById(id: number): Promise<EventWithRelations> {
        const event = await this.eventsRepository.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findByCompanyId(companyId: number): Promise<EventWithRelations[]> {
        const events = await this.eventsRepository.findByCompanyId(companyId);
        return plainToInstance(Event, events, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(id: number, eventDto: UpdateEventDto): Promise<Event> {
        let event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        event = await this.eventsRepository.update(id, {...event, ...eventDto });
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async delete(id: number): Promise<void> {
        const event = await this.eventsRepository.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return this.eventsRepository.delete(id);
    }

    async updatePoster(id: number, posterName: string): Promise<Event> {
        let existingEvent = await this.eventsRepository.findById(id);

        if (!existingEvent) {
            throw new NotFoundException(`Event not found`);
        }

        const event = await this.eventsRepository.update(id, { posterName } as Event);

        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async syncThemes(eventId: number, eventThemesDto: CreateEventThemesDto): Promise<void> {
        const event = await this.findById(eventId);
        return this.eventsRepository.syncThemes(event.id, eventThemesDto.themes.map(theme => theme.id));
    }
}
