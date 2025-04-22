// test/fake-data/fake-news.ts
import { faker } from '@faker-js/faker';
import { CreateNewsDto } from '../../src/models/news/dto/create-news.dto';
import { News, SERIALIZATION_GROUPS } from '../../src/models/news/entities/news.entity';
import { plainToInstance } from 'class-transformer';

export const generateFakeCreateNewsDto = (): CreateNewsDto => {
    return {
        title: faker.lorem.sentence({ min: 3, max: 10 }),
        description: faker.lorem.paragraph({ min: 3, max: 10 }),
    };
};

export const generateFakeNews = (
    authorId: number,
    companyId: number | null = null,
    eventId: number | null = null,
): News => {
    const basicNews = generateFakeCreateNewsDto();
    const now = new Date();

    const newsData = {
        id: faker.number.int({ min: 1, max: 1000 }),
        authorId,
        companyId: companyId ?? faker.number.int({ min: 1, max: 1000 }),
        eventId: eventId ?? faker.number.int({ min: 1, max: 1000 }),
        ...basicNews,
        createdAt: now,
        updatedAt: now,
    };

    return plainToInstance(News, newsData, {
        groups: SERIALIZATION_GROUPS.BASIC,
    });
};

export const generateFakeCompanyNewsList = (
    count: number | undefined,
    authorId: number,
    companyId: number,
): News[] => {
    return Array.from({ length: count ?? faker.number.int({ min: 1, max: 5 }) }, () =>
        generateFakeNews(authorId, companyId, null),
    );
};

export const generateFakeEventNewsList = (
    count: number | undefined,
    authorId: number,
    eventId: number,
): News[] => {
    return Array.from({ length: count ?? faker.number.int({ min: 1, max: 5 }) }, () =>
        generateFakeNews(authorId, null, eventId),
    );
};

export const pickNewsFields = <T extends keyof News>(
    news: News,
    fields: T[],
): Pick<News, T> => {
    const result = {} as Pick<News, T>;
    fields.forEach((field) => {
        result[field] = news[field];
    });
    return result;
}; 