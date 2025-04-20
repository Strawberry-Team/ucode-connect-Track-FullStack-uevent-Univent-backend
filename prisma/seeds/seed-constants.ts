// prisma/seeds/seed-constants.ts
export const SEEDS = {
    PRODUCT: {
        DOMAIN: 'uevent.com',
    },
    USERS: {
        TOTAL: 30,
        ADMINS: 1,
        PASSWORD: 'Password123!$',
        PROFILE_PICTURE: 'default-avatar.png',
    },
    COMPANIES: {
        TOTAL: 10,
        EMAIL_LOCAL: 'support',
        DESCRIPTION_PHRASES: 7,
        LOGO: 'default-logo.png'
    },
    EVENTS: {
        TOTAL: 30,
        POSTER: 'default-poster.png',
        MIN_THEMES_PER_EVENT: 1,
        MAX_THEMES_PER_EVENT: 3,
        DESCRIPTION_PHRASES: 3,
        START_DATE: {
            MIN_DAYS: 10,
            MAX_DAYS: 30,
        },
        START_TIME: {
            MIN_HOUR: 12,
            MAX_HOUR: 20,
        },
        DURATION: {
            MIN_HOURS: 1,
            MAX_HOURS: 4,
        },
        TICKETS_AVAILABLE: {
            MIN_DAYS_BEFORE: 1,
            MAX_DAYS_BEFORE: 8,
        },
        STATUS_WEIGHTS: {
            DRAFT: 5,
            PUBLISHED: 10,
            SALES_STARTED: 60,
            ONGOING: 10,
            FINISHED: 10,
            CANCELLED: 5,
        },
        ATTENDEE_VISIBILITY_WEIGHTS: {
            EVERYONE: 60,
            ATTENDEES_ONLY: 20,
            NOBODY: 20,
        },
    },
    FORMATS: {
        TOTAL: 15,
    },
    THEMES: {
        TOTAL: 50,
    },
    TICKETS: {
        NUMBER_PREFIX: 'TICKET',
        MIN_PER_EVENT: 10,
        MAX_PER_EVENT: 100,
        TYPES: {
            STANDARD: {
                TITLE: 'Standard',
                MIN_PRICE: 200,
                MAX_PRICE: 500,
            },
            VIP: {
                TITLE: 'VIP',
                MIN_PRICE: 800,
                MAX_PRICE: 2000,
            },
            PREMIUM: {
                TITLE: 'Premium',
                MIN_PRICE: 2500,
                MAX_PRICE: 5000,
            },
        },
        STATUS_WEIGHTS: {
            AVAILABLE: 75,
            RESERVED: 5,
            SOLD: 15,
            UNAVAILABLE: 5,
        },
    },
    NEWS: {
        MIN_PER_COMPANY: 1,
        MAX_PER_COMPANY: 5,
        MIN_PER_EVENT: 0,
        MAX_PER_EVENT: 3,
        DESCRIPTION: {
            MIN_PARAGRAPHS: 5,
            MAX_PARAGRAPHS: 10,
        },
    },
    PROMO_CODES: {
        CODES: ['WELCOME10', 'SUMMER20', 'VIP30'],
        DISCOUNT: {
            MIN: 0.1,
            MAX: 0.5,
        },
        TITLE_PREFIX: 'Exclusive Promo for Event',
    },
    EVENT_ATTENDEES: {
        MIN_PER_EVENT: 1,
        MAX_PER_EVENT: 5,
        VISIBILITY: {
            HIDDEN_THRESHOLD: 4,
        },
    },
    ORDERS: {
        TOTAL: 50,
        CREATED_AT: {
            MIN_DAYS: 1,
            MAX_DAYS: 30,
        },
        STATUS_WEIGHTS: {
            PENDING: 20,
            PAID: 60,
            FAILED: 10,
            REFUNDED: 10,
        },
        PAYMENT_METHOD_WEIGHTS: {
            STRIPE: 70
        },
        DISCOUNT_PROBABILITY: 0.3,
        ITEMS: {
            MIN_PER_ORDER: 1,
            MAX_PER_ORDER: 5,
            MIN_TICKETS_PER_ITEM: 1,
            MAX_TICKETS_PER_ITEM: 4,
            TICKET_TYPE_WEIGHTS: {
                STANDARD: 70,
                VIP: 20,
                PREMIUM: 10,
            },
        },
    },
    SUBSCRIPTIONS: {
        MIN_EVENTS_PER_USER: 0,
        MAX_EVENTS_PER_USER: 8,
        MIN_COMPANIES_PER_USER: 0,
        MAX_COMPANIES_PER_USER: 6,
    },
} as const;
