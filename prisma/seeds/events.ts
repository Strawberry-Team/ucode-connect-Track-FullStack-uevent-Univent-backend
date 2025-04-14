// prisma/seeds/events.ts
import { faker } from '@faker-js/faker';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { initialCompanies } from './companies';
import { initialFormats } from './formats';
import { SEED_COUNTS } from './seed-constants';

function generateEventThemes(): number[] {
    const themesCount = faker.number.int({ 
        min: SEED_COUNTS.EVENTS.MIN_THEMES_PER_EVENT, 
        max: SEED_COUNTS.EVENTS.MAX_THEMES_PER_EVENT 
    });

    const themes = new Set<number>();
    
    while (themes.size < themesCount) {
        themes.add(faker.number.int({ min: 1, max: SEED_COUNTS.THEMES }));
    }
    
    return Array.from(themes);
}

export const initialEvents = Array.from({ length: SEED_COUNTS.EVENTS.TOTAL }, (_, index) => {
    const startDate = faker.date.soon({ 
        days: faker.number.int({ 
            min: SEED_COUNTS.EVENTS.START_DATE.MIN_DAYS, 
            max: SEED_COUNTS.EVENTS.START_DATE.MAX_DAYS 
        }), 
        refDate: new Date()
    });
    startDate.setHours(faker.number.int({ 
        min: SEED_COUNTS.EVENTS.START_TIME.MIN_HOUR, 
        max: SEED_COUNTS.EVENTS.START_TIME.MAX_HOUR 
    }), 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + faker.number.int({ 
        min: SEED_COUNTS.EVENTS.DURATION.MIN_HOURS, 
        max: SEED_COUNTS.EVENTS.DURATION.MAX_HOURS 
    }));

    const companyId = faker.number.int({ min: 1, max: SEED_COUNTS.COMPANIES.TOTAL });
    const formatId = faker.number.int({ min: 1, max: SEED_COUNTS.FORMATS });
    const themes = generateEventThemes();

    return {
        companyId,
        formatId,
        title: faker.company.catchPhraseAdjective(),
        description: Array.from(
            { length: SEED_COUNTS.EVENTS.DESCRIPTION_PHRASES }, 
            () => faker.company.catchPhrase()
        ).join('. ') + '.',
        venue: `${faker.location.zipCode()}, ${faker.location.country()}, ${faker.location.city()}, ${faker.company.name()}`,
        locationCoordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
        startedAt: startDate,
        endedAt: endDate,
        publishedAt: new Date(),
        ticketsAvailableFrom: faker.date.recent({ 
            days: faker.number.int({ 
                min: SEED_COUNTS.EVENTS.TICKETS_AVAILABLE.MIN_DAYS_BEFORE, 
                max: SEED_COUNTS.EVENTS.TICKETS_AVAILABLE.MAX_DAYS_BEFORE 
            }), 
            refDate: startDate 
        }),
        posterName: 'default-poster.png',
        attendeeVisibility: faker.helpers.arrayElement(Object.values(AttendeeVisibility)),
        status: faker.helpers.arrayElement(Object.values(EventStatus)),
        themes: generateEventThemes(),
    };
}); 