import { Injectable, NotFoundException } from '@nestjs/common';
import { FormatsRepository } from './formats.repository';
import { Format, SERIALIZATION_GROUPS } from './entities/formats.entity';
import { plainToInstance } from 'class-transformer';
import { CreateFormatDto } from './dto/create-format.dto';
@Injectable()
export class FormatsService {
    constructor(private readonly formatsRepository: FormatsRepository) {}

    async findAll(): Promise<Format[]> {
        return plainToInstance(Format, await this.formatsRepository.findAll(), {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async findById(id: number): Promise<Format> {
        const format = await this.formatsRepository.findById(id);
        if (!format) {
            throw new NotFoundException('Format not found');
        }
        return plainToInstance(Format, format, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async create(format: CreateFormatDto): Promise<Format> {
        return plainToInstance(Format, await this.formatsRepository.create(format), {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }
}
