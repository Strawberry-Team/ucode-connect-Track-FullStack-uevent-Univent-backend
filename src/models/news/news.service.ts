// src/models/news/news.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { EventsService } from '../events/events.service';
import { News } from './entities/news.entity';
import { NewsRepository } from './news.repository';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
    constructor(
        private readonly newsRepository: NewsRepository,
        private readonly usersService: UsersService,
        private readonly companiesService: CompaniesService,
        private readonly eventsService: EventsService,
    ) {}

    async create(
        dto: CreateNewsDto,
        userId: number,
        companyId: number | undefined,
        eventId: number | undefined,
    ) {
        if (!companyId && !eventId) {
            throw new NotFoundException('The news item must be related to the company or event');
        }

        if (companyId) {
            const existingCompany =
                await this.companiesService.findById(companyId);

            if (!existingCompany) {
                throw new NotFoundException('Company not found');
            }
        }

        if (eventId) {
            const existingEvent = await this.eventsService.findById(eventId);

            if (!existingEvent) {
                throw new NotFoundException('Event not found');
            }
        }

        const news = await this.newsRepository.create({
            ...dto,
            authorId: userId,
            companyId: companyId,
            eventId: eventId,
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
        const news = await this.newsRepository.findById(id);

        if (!news) {
            throw new NotFoundException(`News not found`);
        }

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByAuthorId(authorId: number): Promise<News[]> {
        const existingUser = await this.usersService.findUserById(authorId);

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        const news = await this.newsRepository.findByAuthorId(authorId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByCompanyId(companyId: number): Promise<News[]> {
        const existingCompany = await this.companiesService.findById(companyId);

        if (!existingCompany) {
            throw new NotFoundException('Company not found');
        }

        const news = await this.newsRepository.findByCompanyId(companyId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    public async findByEventId(eventId: number): Promise<News[]> {
        const existingEvent = await this.eventsService.findById(eventId);

        if (!existingEvent) {
            throw new NotFoundException('Event not found');
        }

        const news = await this.newsRepository.findByEventId(eventId);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(newsId: number, dto: UpdateNewsDto): Promise<News> {
        const existingNews = await this.newsRepository.findById(newsId);

        if (!existingNews) {
            throw new NotFoundException(`News not found`);
        }

        const news = await this.newsRepository.update(newsId, dto);

        return plainToInstance(News, news, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async delete(id: number): Promise<void> {
        let existingNews = await this.newsRepository.findById(id);

        if (!existingNews) {
            throw new NotFoundException(`News not found`);
        }

        await this.newsRepository.delete(id);
    }
}
