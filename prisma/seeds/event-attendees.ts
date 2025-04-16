// prisma/seeds/event-attendees.ts

import { faker } from '@faker-js/faker';
import { SEEDS } from './seed-constants';
import { initialEvents } from './events';

interface EventAttendee {
    eventId: number;
    userId: number;
    isVisible: boolean;
}

function generateUniqueUserIds(count: number, excludeIds: number[]): number[] {
    const userIds = new Set<number>();
    const maxAttempts = 100;
    let attempts = 0;
    
    userIds.add(2);

    const availableUserIds = Array.from(
        { length: SEEDS.USERS.TOTAL - 2 },
        (_, i) => i + 3
    ).filter(id => !excludeIds.includes(id));

    const adjustedCount = Math.min(count, availableUserIds.length + 1);

    while (userIds.size < adjustedCount && attempts < maxAttempts) {
        const randomIndex = faker.number.int({ min: 0, max: availableUserIds.length - 1 });
        const userId = availableUserIds[randomIndex];
        
        if (!userIds.has(userId)) {
            userIds.add(userId);
        }
        
        attempts++;
    }

    if (attempts >= maxAttempts) {
        console.warn(`Warning: Reached maximum attempts while generating user IDs for event. Generated ${userIds.size} out of ${count} requested IDs.`);
    }

    return Array.from(userIds);
}

export async function generateEventAttendees(): Promise<EventAttendee[]> {
    const allAttendees: EventAttendee[] = [];
    const usedUserIds = new Set<number>();

    initialEvents.forEach((event, index) => {
        const eventId = index + 1;

        const attendeesCount = faker.number.int({
            min: SEEDS.EVENT_ATTENDEES.MIN_PER_EVENT,
            max: SEEDS.EVENT_ATTENDEES.MAX_PER_EVENT,
        });

        const userIds = generateUniqueUserIds(attendeesCount, Array.from(usedUserIds));
        
        const eventAttendees = userIds.map((userId, userIndex) => {
            const shouldHaveHiddenUser = attendeesCount >= SEEDS.EVENT_ATTENDEES.VISIBILITY.HIDDEN_THRESHOLD;
            const isLastNonTestUser = userIndex === attendeesCount - 1 && userId !== 2;
            const isVisible = !shouldHaveHiddenUser || !isLastNonTestUser;

            return {
                eventId,
                userId,
                isVisible,
            };
        });

        userIds.forEach(id => usedUserIds.add(id));
        
        allAttendees.push(...eventAttendees);
    });

    return allAttendees;
}

export const initialEventAttendees = generateEventAttendees(); 