// src/models/events/themes/themes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventThemesRepository } from './event-themes.repository';
import { EventTheme, SERIALIZATION_GROUPS } from './entities/event-theme.entity';
import { plainToInstance } from 'class-transformer';
import { CreateEventThemeDto } from './dto/create-event-theme.dto';
@Injectable()
export class EventThemesService {
    constructor(private readonly eventThemesRepository: EventThemesRepository) {}

    async create(theme: CreateEventThemeDto): Promise<EventTheme> {
        return this.eventThemesRepository.create(theme);
    }

    async findAll(): Promise<EventTheme[]> {
        return plainToInstance(EventTheme, await this.eventThemesRepository.findAll(), {
                groups: SERIALIZATION_GROUPS.BASIC,
            },
        );
    }

    async findById(id: number): Promise<EventTheme> {
        const theme = await this.eventThemesRepository.findById(id);
        if (!theme) {
            throw new NotFoundException('Theme not found');
        }

        return plainToInstance(EventTheme, theme, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }
}
