// src/models/events/events.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import {
    Event,
    EventWithRelations,
    SERIALIZATION_GROUPS,
} from './entities/event.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventThemesDto } from './dto/create-event-themes.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetEventsDto } from './dto/get-events.dto';
import { CompaniesRepository } from '../companies/companies.repository';
@Injectable()
export class EventsService {
    constructor(
        private readonly eventsRepository: EventsRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly companiesRepository: CompaniesRepository,
    ) {}

    async create(eventDto: CreateEventDto): Promise<Event> {
        const event = await this.eventsRepository.create(eventDto);
        const company = await this.companiesRepository.findById(event.companyId);
        
        this.eventEmitter.emit('event.created', {
            eventId: event.id,
            title: event.title,
            companyId: event.companyId,
            companyTitle: company?.title,
            status: event.status,
        });
        
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async createWithThemes(eventDto: CreateEventDto & { themes?: number[] }): Promise<Event> {
        const event = await this.eventsRepository.createWithThemes(eventDto);
        
        this.eventEmitter.emit('event.created', {
            eventId: event.id,
            title: event.title,
            companyId: event.companyId,
            status: event.status,
        });
        
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findAll(query?: GetEventsDto): 
    Promise<{ items: Event[]; count: number; total: number; minPrice: number | null; maxPrice: number | null; }> {
        const events = await this.eventsRepository.findAllWithTicketPrices(query);
        
        events.items = events.items.map((event) =>  
            plainToInstance(Event, event, {
                groups: SERIALIZATION_GROUPS.BASIC_WITH_TICKETS,
            }),
        );
        
        return events;
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

    async findByCompanyId(companyId: number): Promise<Event[]> {
        const events = await this.eventsRepository.findByCompanyId(companyId);
        return plainToInstance(Event, events, {
            groups: SERIALIZATION_GROUPS.BASIC_WITH_TICKETS,
        });
    }

    async update(id: number, eventDto: UpdateEventDto): Promise<Event> {
        let event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        
        const oldStatus = event.status;
        const oldStartAt = event.startedAt;
        const oldTicketsAvailableFrom = event.ticketsAvailableFrom;
        const oldVenue = event.venue;

        event = await this.eventsRepository.update(id, {
            ...eventDto,
        });
        
        if (eventDto.status && oldStatus !== event.status) {
            this.eventEmitter.emit('event.status.changed', {
                eventId: event.id,
                title: event.title,
                companyId: event.companyId,
                oldStatus: oldStatus,
                newStatus: event.status,
            });
        }

        if (eventDto.startedAt && oldStartAt.getTime() !== event.startedAt.getTime()) {
            this.eventEmitter.emit('event.startAt.changed', {
                eventId: event.id,
                title: event.title,
                companyId: event.companyId,
                oldStartDate: oldStartAt,
                newStartDate: event.startedAt,
            });
        }

        if (eventDto.ticketsAvailableFrom && 
            (!oldTicketsAvailableFrom || !event.ticketsAvailableFrom || 
             oldTicketsAvailableFrom.getTime() !== event.ticketsAvailableFrom.getTime())) {
            this.eventEmitter.emit('event.ticketsAvailableFrom.changed', {
                eventId: event.id,
                title: event.title,
                companyId: event.companyId,
                oldStartDate: oldTicketsAvailableFrom,
                newStartDate: event.ticketsAvailableFrom,
            });
        }

        if (eventDto.venue && oldVenue !== event.venue) {
            this.eventEmitter.emit('event.venue.changed', {
                eventId: event.id,
                title: event.title,
                companyId: event.companyId,
                oldVenue: oldVenue,
                newVenue: event.venue,
            });
        }
        
        return plainToInstance(Event, event, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async delete(id: number): Promise<void> {
        const existingEvent = await this.eventsRepository.findById(id);

        if (!existingEvent) {
            throw new NotFoundException('Event not found');
        }

        if (existingEvent.tickets) {
            throw new BadRequestException(
                `Unable to delete an event with existing tickets`,
            );
        }

        return this.eventsRepository.delete(id);
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

    async syncThemes(
        eventId: number,
        eventThemesDto: CreateEventThemesDto,
    ): Promise<void> {
        const event = await this.findById(eventId);
        return this.eventsRepository.syncThemes(
            event.id,
            eventThemesDto.themes.map((theme) => theme.id),
        );
    }
}
