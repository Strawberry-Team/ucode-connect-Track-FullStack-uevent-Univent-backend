// prisma/seeds/events.ts
import { faker } from '@faker-js/faker';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { SEEDS } from './seed-constants';

function generateEventThemes(): number[] {
    const themesCount = faker.number.int({
        min: SEEDS.EVENTS.MIN_THEMES_PER_EVENT,
        max: SEEDS.EVENTS.MAX_THEMES_PER_EVENT,
    });

    const themes = new Set<number>();

    while (themes.size < themesCount) {
        themes.add(faker.number.int({ min: 1, max: SEEDS.THEMES.TOTAL }));
    }

    return Array.from(themes);
}

export const initialEvents = Array.from(
    { length: SEEDS.EVENTS.TOTAL },
    (_, index) => {
        const startDate = faker.date.soon({
            days: faker.number.int({
                min: SEEDS.EVENTS.START_DATE.MIN_DAYS,
                max: SEEDS.EVENTS.START_DATE.MAX_DAYS,
            }),
            refDate: new Date(),
        });
        startDate.setHours(
            faker.number.int({
                min: SEEDS.EVENTS.START_TIME.MIN_HOUR,
                max: SEEDS.EVENTS.START_TIME.MAX_HOUR,
            }), 0, 0, 0,
        );

        const endDate = new Date(startDate);
        endDate.setHours(
            endDate.getHours() +
                faker.number.int({
                    min: SEEDS.EVENTS.DURATION.MIN_HOURS,
                    max: SEEDS.EVENTS.DURATION.MAX_HOURS,
                }),
        );

        const companyId = faker.number.int({
            min: 1,
            max: SEEDS.COMPANIES.TOTAL,
        });
        const formatId = faker.number.int({
            min: 1,
            max: SEEDS.FORMATS.TOTAL,
        });
        const status = faker.helpers.weightedArrayElement([
            { value: EventStatus.DRAFT, weight: SEEDS.EVENTS.STATUS_WEIGHTS.DRAFT },
            { value: EventStatus.PUBLISHED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.PUBLISHED },
            { value: EventStatus.SALES_STARTED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.SALES_STARTED },
            { value: EventStatus.ONGOING, weight: SEEDS.EVENTS.STATUS_WEIGHTS.ONGOING },
            { value: EventStatus.FINISHED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.FINISHED },
            { value: EventStatus.CANCELLED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.CANCELLED },
        ]);
        const attendeeVisibility = faker.helpers.weightedArrayElement([
            { value: AttendeeVisibility.EVERYONE, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.EVERYONE },
            { value: AttendeeVisibility.ATTENDEES_ONLY, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.ATTENDEES_ONLY },
            { value: AttendeeVisibility.NOBODY, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.NOBODY },
        ]);

        return {
            companyId,
            formatId,
            title: faker.company.catchPhraseAdjective(),
            description:
                Array.from({ length: SEEDS.EVENTS.DESCRIPTION_PHRASES }, () =>
                    faker.company.catchPhrase(),
                ).join('. ') + '.',
            venue: `${faker.location.country()}, ${faker.location.city()}, ${faker.location.street()}`,
            locationCoordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
            startedAt: startDate,
            endedAt: endDate,
            publishedAt: new Date(),
            ticketsAvailableFrom: faker.date.recent({
                days: faker.number.int({
                    min: SEEDS.EVENTS.TICKETS_AVAILABLE.MIN_DAYS_BEFORE,
                    max: SEEDS.EVENTS.TICKETS_AVAILABLE.MAX_DAYS_BEFORE,
                }),
                refDate: startDate,
            }),
            posterName: SEEDS.EVENTS.POSTER,
            attendeeVisibility,
            status,
            themes: generateEventThemes(),
        };
    },
);
