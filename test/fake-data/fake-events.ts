// test/fake-data/fake-events.ts
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { Event } from '../../src/models/events/entities/event.entity';
import { CreateEventDto } from '../../src/models/events/dto/create-event.dto';
import { UpdateEventDto } from '../../src/models/events/dto/update-event.dto';
import { faker } from '@faker-js/faker';

export function generateFakeId(): number {
    return faker.number.int({ min: 1, max: 1000 });
}

function generateFakeEventTitle(): string {
    return faker.lorem.words({ min: 2, max: 4 });
}

function generateFakeEventDescription(): string {
    return faker.lorem.paragraph();
}

function generateFakeEventVenue(): string {
    return faker.location.streetAddress();
}

function generateFakeEventLocationCoordinates(): string {
    return `${faker.location.latitude()},${faker.location.longitude()}`;
}

function generateFakeEventDates(): { startedAt: Date; endedAt: Date; publishedAt: Date; ticketsAvailableFrom: Date } {
    const now = new Date();
    const startedAt = faker.date.future({ refDate: now, years: 1 });
    const endedAt = new Date(startedAt);
    endedAt.setHours(endedAt.getHours() + faker.number.int({ min: 1, max: 8 }));

    const publishedAt = new Date(startedAt);
    publishedAt.setDate(publishedAt.getDate() - faker.number.int({ min: 1, max: 30 }));

    const ticketsAvailableFrom = new Date(publishedAt);
    ticketsAvailableFrom.setDate(ticketsAvailableFrom.getDate() - faker.number.int({ min: 1, max: 7 }));

    return { startedAt, endedAt, publishedAt, ticketsAvailableFrom };
}

export function generateFakeEvent<K extends keyof Event>(
    allFields = true,
    fields: K[] = [],
): Pick<Event, K> {
    const { startedAt, endedAt, publishedAt, ticketsAvailableFrom } = generateFakeEventDates();

    const fakeEvent: Event = {
        id: generateFakeId(),
        companyId: generateFakeId(),
        formatId: generateFakeId(),
        title: generateFakeEventTitle(),
        description: generateFakeEventDescription(),
        venue: generateFakeEventVenue(),
        locationCoordinates: generateFakeEventLocationCoordinates(),
        startedAt,
        endedAt,
        publishedAt,
        ticketsAvailableFrom,
        posterName: faker.system.fileName({ extensionCount: 0 }) + '.jpg',
        attendeeVisibility: faker.helpers.arrayElement(Object.values(AttendeeVisibility)),
        status: faker.helpers.arrayElement(Object.values(EventStatus)),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    if (allFields) {
        return fakeEvent;
    }

    const event = {} as Pick<Event, K>;

    fields.forEach((field) => {
        event[field] = fakeEvent[field];
    });

    return event;
}

export function pickEventFields<T extends Event, K extends keyof T>(
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

export function generateFakeCreateEventDto<K extends keyof CreateEventDto>(
    allFields = true,
    fields: K[] = [],
): Pick<CreateEventDto, K> {
    const event = generateFakeEvent();
    const dto = {} as Pick<CreateEventDto, K>;

    if (allFields) {
        return {
            title: event.title,
            description: event.description,
            venue: event.venue,
            locationCoordinates: event.locationCoordinates,
            startedAt: event.startedAt,
            endedAt: event.endedAt,
            publishedAt: event.publishedAt,
            ticketsAvailableFrom: event.ticketsAvailableFrom,
            posterName: event.posterName,
            attendeeVisibility: event.attendeeVisibility,
            status: event.status,
            companyId: event.companyId,
            formatId: event.formatId,
        } as Pick<CreateEventDto, K>;
    }

    fields.forEach((field) => {
        if (field in event) {
            dto[field] = event[field];
        }
    });

    return dto;
}

export function generateFakeUpdateEventDto<K extends keyof UpdateEventDto>(
    allFields = true,
    fields: K[] = [],
    excludeFields: (keyof Event)[] = [],
): Pick<UpdateEventDto, K> {
    const event = generateFakeEvent();
    const dto = {} as Pick<UpdateEventDto, K>;

    if (allFields) {
        const allFieldsDto = {
            title: event.title,
            description: event.description,
            venue: event.venue,
            locationCoordinates: event.locationCoordinates,
            startedAt: event.startedAt,
            endedAt: event.endedAt,
            publishedAt: event.publishedAt,
            ticketsAvailableFrom: event.ticketsAvailableFrom,
            posterName: event.posterName,
            attendeeVisibility: event.attendeeVisibility,
            status: event.status,
            companyId: event.companyId,
            formatId: event.formatId,
        };

        // Видаляємо виключені поля
        excludeFields.forEach((field) => {
            delete allFieldsDto[field];
        });

        return allFieldsDto as Pick<UpdateEventDto, K>;
    }

    fields.forEach((field) => {
        if (field in event && !excludeFields.includes(field as keyof Event)) {
            dto[field] = event[field];
        }
    });

    return dto;
}
