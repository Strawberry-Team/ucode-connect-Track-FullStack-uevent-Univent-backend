// src/models/news/news.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { EventsService } from '../events/events.service';
import { News } from './entities/news.entity';
import { NewsRepository } from './news.repository';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from './entities/news.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class NewsService {
    constructor(
        private readonly newsRepository: NewsRepository,
        private readonly usersService: UsersService,
        private readonly companiesService: CompaniesService,
        private readonly eventsService: EventsService,
    ) {}

    async create(dto: CreateNewsDto, userId: number) {
        if (dto.companyId) {
            const existingCompany = await this.companiesService.findById(
                dto.companyId,
            );

            if (!existingCompany) {
                throw new NotFoundException('Company not found');
            }
        }

        if (dto.eventId) {
            const existingEvent = await this.eventsService.findEventById(
                dto.eventId,
            );

            if (!existingEvent) {
                throw new NotFoundException('Event not found');
            }
        }

        const news = await this.newsRepository.create({
            ...dto,
            authorId: userId,
        });

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findAll(): Promise<News[][]> {
        const news = await this.newsRepository.findAll();

        return news.map((company) =>
            plainToInstance(News, news, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );
    }

    public async findById(id: number): Promise<News> {
        if (!id || id < 0) {
            throw new BadRequestException('News id must be greater than 0');
        }

        const news = await this.newsRepository.findById(id);

        if (!news) {
            throw new NotFoundException(`News not found`);
        }

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByAuthorId(authorId: number): Promise<News[]> {
        if (!authorId || authorId < 0) {
            throw new BadRequestException(
                'News author id must be greater than 0',
            );
        }

        const news = await this.newsRepository.findByAuthorId(authorId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByCompanyId(companyId: number): Promise<News[]> {
        if (!companyId || companyId < 0) {
            throw new BadRequestException(
                'News company id must be greater than 0',
            );
        }

        const news = await this.newsRepository.findByCompanyId(companyId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByEventId(eventId: number): Promise<News[]> {
        if (!eventId || eventId < 0) {
            throw new BadRequestException(
                'News event id must be greater than 0',
            );
        }

        const news = await this.newsRepository.findByEventId(eventId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(id: number, dto: UpdateNewsDto): Promise<News> {
        const existingNews = await this.newsRepository.findById(id);

        if (!existingNews) {
            throw new NotFoundException(`News not found`);
        }

        if (dto.companyId) {
            const existingCompany = await this.companiesService.findById(
                dto.companyId,
            );

            if (!existingCompany) {
                throw new NotFoundException('Company not found');
            }
        }

        if (dto.eventId) {
            const existingEvent = await this.eventsService.findEventById(
                dto.eventId,
            );

            if (!existingEvent) {
                throw new NotFoundException('Event not found');
            }
        }

        const news = await this.newsRepository.update(id, dto);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async delete(id: number): Promise<void> {
        if (!id || id < 0) {
            throw new BadRequestException('News id must be greater than 0');
        }

        let existingNews = await this.newsRepository.findById(id);

        if (!existingNews) {
            throw new NotFoundException(`News not found`);
        }

        await this.newsRepository.delete(id);
    }
}
