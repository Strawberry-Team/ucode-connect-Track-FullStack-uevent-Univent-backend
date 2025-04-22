// test/fake-data/fake-companies.ts
import { Company, SERIALIZATION_GROUPS } from '../../src/models/companies/entities/company.entity';
import { faker } from '@faker-js/faker';
import { generateFakeUser } from './fake-users';
import { AttendeeVisibility } from '@prisma/client';
import { EventStatus } from '@prisma/client';
import { Event } from '../../src/models/events/entities/event.entity';
import { plainToInstance } from 'class-transformer';

export function generateFakeId(): number {
    return faker.number.int({ min: 1, max: 100 });
}

function generateFakeCompanyEmail(title: string): string {
    return faker.internet.email({
        firstName: 'customer',
        lastName: 'support',
        provider: title.toLowerCase().replace(' ', '.') + '.com',
        allowSpecialCharacters: false,
    });
}

function generateFakeCompanyTitle(): string {
    return faker.company.catchPhraseNoun();
}

function generateFakeCompanyDescription(): string {
    return faker.company.catchPhrase();
}

export function generateFakeLogoName(): string {
    return `profile-${faker.string.uuid()}.jpg`;
}

export function generateFakeCompany<K extends keyof Company>(
    ownerId: number,
    allFields: boolean = true,
    fields: K[] = [],
): Pick<Company, K> {
    const title = generateFakeCompanyTitle();
    const fakeCompany: Company = {
        id: generateFakeId(),
        ownerId: ownerId,
        email: generateFakeCompanyEmail(title),
        title: title,
        description: generateFakeCompanyDescription(),
        logoName: generateFakeLogoName(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const transformedCompany = plainToInstance(Company, fakeCompany, {
        groups: SERIALIZATION_GROUPS.BASIC,
    });

    if (allFields) {
        return transformedCompany;
    }

    const company = {} as Pick<Company, K>;

    fields.forEach((field) => {
        company[field] = transformedCompany[field];
    });

    return company;
}

export function pickCompanyFields<T extends Company, K extends keyof T>(
    obj: T,
    fields: K[],
): Pick<T, K> {
    const result = {} as Pick<T, K>;

    fields.forEach((field) => {
        if (field in obj) {
            result[field] = obj[field];
        }
    });

    return result;
}

export function generateFakeBasicEvent(companyId?: number): Event {
    const now = new Date();
    const startedAt = faker.date.future({ refDate: now, years: 1 });
    const endedAt = new Date(startedAt);
    endedAt.setHours(endedAt.getHours() + faker.number.int({ min: 1, max: 8 }));

    const publishedAt = faker.datatype.boolean() ? new Date(startedAt) : null;
    if (publishedAt) {
        publishedAt.setDate(publishedAt.getDate() - faker.number.int({ min: 1, max: 30 }));
    }

    const ticketsAvailableFrom = publishedAt ? new Date(publishedAt) : null;
    if (ticketsAvailableFrom) {
        ticketsAvailableFrom.setDate(ticketsAvailableFrom.getDate() - faker.number.int({ min: 1, max: 7 }));
    }

    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        companyId: companyId?? faker.number.int({ min: 1, max: 1000 }),
        formatId: faker.number.int({ min: 1, max: 1000 }),
        title: faker.lorem.words({ min: 2, max: 4 }),
        description: faker.lorem.paragraph(),
        venue: faker.location.streetAddress(),
        locationCoordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
        startedAt,
        endedAt,
        publishedAt,
        ticketsAvailableFrom,
        posterName: faker.system.fileName({ extensionCount: 0 }) + '.jpg',
        attendeeVisibility: faker.helpers.arrayElement(Object.values(AttendeeVisibility)),
        status: faker.helpers.arrayElement(Object.values(EventStatus)),
        createdAt: new Date(),
        updatedAt: new Date()
    };
}