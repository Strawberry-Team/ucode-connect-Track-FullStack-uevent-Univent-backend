// prisma/seeds/news.ts
import { faker } from '@faker-js/faker';
import { initialCompanies } from './companies';
import { initialEvents } from './events';
import { initialFormats } from './formats';
import { SEED_COUNTS } from './seed-constants';

function generateNewsTitle(formatId: number): string {
    const actions = [
        'Announcing',
        'Updates about',
        'Important information about',
        'Latest news about',
        'Special announcement about',
        'Schedule changes for',
    ];

    let formatTitle: string;

    if (formatId === 0) {
        formatTitle = 'company';
    } else {
        formatTitle = initialFormats
        .find(format => format.id === formatId)?.title 
        || `Test format ${formatId}`;
    }

    return `${faker.helpers.arrayElement(actions)} ${formatTitle.toLowerCase()}`;
}

function generateNewsDescription(): string {
    const paragraphs = Array.from(
        { length: faker.number.int({ 
            min: SEED_COUNTS.NEWS.DESCRIPTION.MIN_PARAGRAPHS, 
            max: SEED_COUNTS.NEWS.DESCRIPTION.MAX_PARAGRAPHS 
        }) },
        () => faker.lorem.paragraph()
    );
    
    return paragraphs.join('\n\n');
}

const companyNews = initialCompanies.flatMap((company, index) => {
    const newsCount = faker.number.int({ 
        min: SEED_COUNTS.NEWS.MIN_PER_COMPANY, 
        max: SEED_COUNTS.NEWS.MAX_PER_COMPANY 
    });
    
    return Array.from({ length: newsCount }, () => ({
        authorId: company.ownerId,
        companyId: index + 1,
        eventId: null,
        title: generateNewsTitle(0),
        description: generateNewsDescription(),
    }));
});

const eventNews = initialEvents.flatMap((event, index) => {
    const newsCount = faker.number.int({ 
        min: SEED_COUNTS.NEWS.MIN_PER_EVENT, 
        max: SEED_COUNTS.NEWS.MAX_PER_EVENT 
    });
    
    const company = initialCompanies[event.companyId - 1];
    if (!company) return [];
    
    return Array.from({ length: newsCount }, () => ({
        authorId: company.ownerId,
        companyId: null,
        eventId: index + 1,
        title: generateNewsTitle(event.formatId),
        description: generateNewsDescription(),
    }));
});

export const initialNews = [...companyNews, ...eventNews]; 