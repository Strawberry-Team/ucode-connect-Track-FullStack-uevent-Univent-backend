import { EventAttendee, AttendeeVisibility } from '@prisma/client';
import { faker } from '@faker-js/faker';

/**
 * Генерує фейкові дані для моделі EventAttendee
 */
export function generateFakeEventAttendee(
    override: Partial<EventAttendee> = {},
): EventAttendee {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        eventId: faker.number.int({ min: 1, max: 1000 }),
        userId: faker.number.int({ min: 1, max: 1000 }),
        isVisible: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ...override,
    };
}

/**
 * Генерує фейкові дані для моделі EventAttendee з вказаними відношеннями
 */
export function generateFakeEventAttendeeWithUser(
    override: Partial<EventAttendee & { users: any }> = {},
): EventAttendee & { users: any } {
    const attendee = generateFakeEventAttendee(override);
    
    return {
        ...attendee,
        users: {
            id: attendee.userId,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            profilePictureName: 'default-avatar.png',
        },
        ...override,
    };
}

/**
 * Генерує масив фейкових даних EventAttendee
 */
export function generateFakeEventAttendees(
    count: number = 3,
    override: Partial<EventAttendee> = {},
): EventAttendee[] {
    return Array.from({ length: count }, () => generateFakeEventAttendee(override));
}

/**
 * Генерує масив фейкових даних EventAttendee з користувачами
 */
export function generateFakeEventAttendeesWithUsers(
    count: number = 3,
    override: Partial<EventAttendee & { users: any }> = {},
): (EventAttendee & { users: any })[] {
    return Array.from({ length: count }, () => generateFakeEventAttendeeWithUser(override));
}

/**
 * Генерує фейкові дані для події з різними налаштуваннями видимості учасників
 */
export function generateFakeEventWithAttendeeVisibility(
    visibility: AttendeeVisibility = AttendeeVisibility.EVERYONE
): any {
    return {
        id: faker.number.int({ min: 1, max: 1000 }),
        title: faker.lorem.words({ min: 2, max: 4 }),
        attendeeVisibility: visibility,
        companyId: faker.number.int({ min: 1, max: 1000 }),
    };
} 