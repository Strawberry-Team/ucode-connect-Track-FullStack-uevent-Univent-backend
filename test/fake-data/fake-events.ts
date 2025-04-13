// test/fake-data/fake-events.ts
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { Event, EventWithRelations } from '../../src/models/events/entities/event.entity';
import { CreateEventDto } from '../../src/models/events/dto/create-event.dto';
import { UpdateEventDto } from '../../src/models/events/dto/update-event.dto';
import { faker } from '@faker-js/faker';

export function generateFakeBasicEvent(): Event {
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
        companyId: faker.number.int({ min: 1, max: 1000 }),
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

export function generateFakeEventWithRelations(): EventWithRelations {
    const basicEvent = generateFakeBasicEvent();
    return {
        ...basicEvent,
        themes: [
            {
                id: faker.number.int({ min: 1, max: 1000 }),
                title: faker.lorem.words(2)
            }
        ],
        company: {
            id: basicEvent.companyId,
            title: faker.company.name(),
            logoName: faker.system.fileName({ extensionCount: 0 }) + '.png'
        },
        format: {
            id: basicEvent.formatId,
            title: faker.helpers.arrayElement(['Conference', 'Workshop', 'Meetup', 'Webinar'])
        }
    };
}

export function generateFakeCreateEventDto(): CreateEventDto {
    const event = generateFakeBasicEvent();
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
        formatId: event.formatId
    };
}

export function generateFakeUpdateEventDto(): UpdateEventDto {
    const event = generateFakeBasicEvent();
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
        formatId: event.formatId
    };
}
