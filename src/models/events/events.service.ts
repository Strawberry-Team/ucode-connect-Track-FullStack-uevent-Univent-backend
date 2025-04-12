// src/models/events/events.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { Event, SERIALIZATION_GROUPS } from './entities/event.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(private readonly eventsRepository: EventsRepository) {}

    async create(eventDto: CreateEventDto): Promise<Event> {
        const event = await this.eventsRepository.create(eventDto);

        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findAll(): Promise<Event[]> {
        const events = await this.eventsRepository.findAll();

        return events.map((event) =>
            plainToInstance(Event, event, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );
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
        const event = await this.eventsRepository.findByCompanyId(companyId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(id: number, eventDto: UpdateEventDto): Promise<Event> {
        const existingEvent = await this.eventsRepository.findById(id);

        if (!existingEvent) {
            throw new NotFoundException('Event not found');
        }

        const event = await this.eventsRepository.update(id, eventDto);

        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updatePoster(id: number, posterName: string): Promise<Event> {
        let existingEvent = await this.eventsRepository.findById(id);

        if (!existingEvent) {
            throw new NotFoundException(`Event not found`);
        }

        const event = await this.eventsRepository.update(id, { posterName });

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
}
