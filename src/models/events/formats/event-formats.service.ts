// src/models/events/formats/formats.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventFormatsRepository } from './event-formats.repository';
import { EventFormat, SERIALIZATION_GROUPS } from './entities/event-format.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventFormatDto } from './dto/create-event-format.dto';

@Injectable()
export class EventFormatsService {
    constructor(private readonly formatsRepository: EventFormatsRepository) {}

    async create(format: CreateEventFormatDto): Promise<EventFormat> {
        return plainToInstance(
            EventFormat,
            await this.formatsRepository.create(format),
            {
                groups: SERIALIZATION_GROUPS.BASIC,
            },
        );
    }

    async findAll(): Promise<EventFormat[]> {
        return plainToInstance(EventFormat, await this.formatsRepository.findAll(), {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findById(id: number): Promise<EventFormat> {
        const format = await this.formatsRepository.findById(id);
        if (!format) {
            throw new NotFoundException('Format not found');
        }
        return plainToInstance(EventFormat, format, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }
}
