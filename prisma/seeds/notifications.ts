import { faker } from '@faker-js/faker';
import { initialCompanies } from './companies';
import { initialEvents } from './events';
import { EventStatus } from '@prisma/client';
import { format, addDays } from 'date-fns';
import { initialSubscriptions } from './subscriptions';
import { EntityType } from '../../src/models/subscriptions/dto/create-subscription.dto';
import { SEEDS } from './seed-constants';

type NotificationCreate = {
    title: string;
    content: string;
    eventId: number | null;
    companyId: number | null;
    createdAt: Date;
    updatedAt: Date;
    readAt: Date | null;
    hiddenAt: Date | null;
    userId: number;
};

export const createInitialNotifications = async () => {
    // Generate notifications for events
    const eventNotifications = initialEvents.flatMap((event, eventIndex) => {
        const eventId = eventIndex + 1; // Events are 1-indexed in the database
        const notifications: NotificationCreate[] = [];

        // Get subscribers for this event
        const eventSubscribers = initialSubscriptions
            .filter(sub => sub.entityType === EntityType.EVENT && sub.entityId === eventId)
            .map(sub => sub.userId);

        if (eventSubscribers.length === 0) {
            return [];
        }

        // 1. Status change notifications
        const statusWeights = SEEDS.NOTIFICATIONS.EVENT.STATUS_CHANGE.WEIGHTS;
        const newStatus = faker.helpers.arrayElement(
            Object.keys(statusWeights).filter(key => statusWeights[key as keyof typeof statusWeights] > 0)
        ) as EventStatus;

        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.STATUS_CHANGE.TITLE,
                content: getStatusChangeMessage(newStatus, event.title),
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 2. Start date change notifications
        const oldStartDate = faker.date.past();
        const daysToShift = faker.number.int({
            min: SEEDS.NOTIFICATIONS.EVENT.START_DATE_CHANGE.MIN_DAYS_SHIFT,
            max: SEEDS.NOTIFICATIONS.EVENT.START_DATE_CHANGE.MAX_DAYS_SHIFT,
        });
        const newStartDate = addDays(oldStartDate, daysToShift);
        
        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.START_DATE_CHANGE.TITLE,
                content: `Event "${event.title}" start date postponed from ${format(oldStartDate, "MMMM d, yyyy HH:mm")} to ${format(newStartDate, "MMMM d, yyyy HH:mm")}`,
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 3. Tickets available date change notifications
        const daysToShiftTickets = faker.number.int({
            min: SEEDS.NOTIFICATIONS.EVENT.TICKETS_SALE_DATE_CHANGE.MIN_DAYS_SHIFT,
            max: SEEDS.NOTIFICATIONS.EVENT.TICKETS_SALE_DATE_CHANGE.MAX_DAYS_SHIFT,
        });
        const newTicketSaleDate = addDays(new Date(), daysToShiftTickets);
        
        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.TICKETS_SALE_DATE_CHANGE.TITLE,
                content: `Start of ticket sales for the "${event.title}" event postponed to ${format(newTicketSaleDate, "MMM d, yyyy HH:mm")}`,
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 4. Venue change notifications
        const oldVenue = `${faker.location.country()}, ${faker.location.city()}, ${faker.location.street()}`;
        const newVenue = `${faker.location.country()}, ${faker.location.city()}, ${faker.location.street()}`;
        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.VENUE_CHANGE.TITLE,
                content: `Event "${event.title}" moved from ${oldVenue} to ${newVenue}`,
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 5. Event creation notifications
        const company = initialCompanies[event.companyId - 1];
        const companySubscribers = initialSubscriptions
            .filter(sub => sub.entityType === EntityType.COMPANY && sub.entityId === event.companyId)
            .map(sub => sub.userId);

        companySubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.CREATION.TITLE,
                content: `New event "${event.title}" published by "${company.title}" company`,
                eventId,
                companyId: event.companyId,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 6. News notifications for event
        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.NEWS.TITLE,
                content: `News on the "${event.title}" event published: "${faker.company.catchPhrase()}"`,
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        // 7. New attendee notifications
        const attendeeName = `${faker.person.firstName()} ${faker.person.lastName()}`;
        eventSubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.EVENT.ATTENDEE.TITLE,
                content: `User ${attendeeName} joined the event "${event.title}"`,
                eventId,
                companyId: null,
                userId,
                ...generateNotificationDates(),
            });
        });

        return notifications;
    });

    // Generate notifications for companies
    const companyNotifications = initialCompanies.flatMap((company, companyIndex) => {
        const companyId = companyIndex + 1; // Companies are 1-indexed in the database
        const notifications: NotificationCreate[] = [];

        // Get subscribers for this company
        const companySubscribers = initialSubscriptions
            .filter(sub => sub.entityType === EntityType.COMPANY && sub.entityId === companyId)
            .map(sub => sub.userId);

        if (companySubscribers.length === 0) {
            return [];
        }

        // Company news notifications
        companySubscribers.forEach(userId => {
            notifications.push({
                title: SEEDS.NOTIFICATIONS.COMPANY.NEWS.TITLE,
                content: `News on the "${company.title}" company published: "${faker.company.catchPhrase()}"`,
                eventId: null,
                companyId,
                userId,
                ...generateNotificationDates(),
            });
        });

        return notifications;
    });

    return [...eventNotifications, ...companyNotifications];
};

function generateNotificationDates(): Pick<NotificationCreate, 'createdAt' | 'updatedAt' | 'readAt' | 'hiddenAt'> {
    const daysAgo = faker.number.int({
        min: SEEDS.NOTIFICATIONS.DATES.MIN_DAYS_AGO,
        max: SEEDS.NOTIFICATIONS.DATES.MAX_DAYS_AGO,
    });
    const createdAt = addDays(new Date(), -daysAgo);

    return {
        createdAt,
        updatedAt: createdAt,
        readAt: Math.random() < SEEDS.NOTIFICATIONS.READ_PROBABILITY 
            ? faker.date.between({ from: createdAt, to: new Date() })
            : null,
        hiddenAt: Math.random() < SEEDS.NOTIFICATIONS.HIDDEN_PROBABILITY
            ? faker.date.between({ from: createdAt, to: new Date() })
            : null,
    };
}

function getStatusChangeMessage(newStatus: EventStatus, title: string): string {
    switch (newStatus) {
        case EventStatus.SALES_STARTED:
            return `Ticket sales for the "${title}" event have started`;
        case EventStatus.ONGOING:
            return `The "${title}" event has started`;
        case EventStatus.FINISHED:
            return `The "${title}" event has finished`;
        case EventStatus.CANCELLED:
            return `The "${title}" event has been cancelled`;
        case EventStatus.PUBLISHED:
            return `The "${title}" event has been published`;
        case EventStatus.DRAFT:
            return `The "${title}" event has been moved to draft`;
        default:
            return `The "${title}" event status has changed`;
    }
} 