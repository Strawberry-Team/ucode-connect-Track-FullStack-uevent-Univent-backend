// prisma/seeds/seed-constants.ts
export const SEEDS = {
    PRODUCT: {
        DOMAIN: 'univent.com',
        THEME_ID: null, // 2 or null
    },
    USERS: {
        TOTAL: 30,
        ADMINS: 1,
        PASSWORD: 'Password123!$',
        GENDER_PROBABILITY: 0.5,
        DEFAULT_AVATAR_PICTURE: 'default-avatar.png',
        AVATAR_MASK: 'user-avatar-*.png',
        AVATAR_COUNT: 30,
        GENERATE_AVATARS: false,
        PROFILE_PICTURE_QUERY_POSTFIX: 'profile portrait person face',
        PROFILE_PICTURE_MASK: '_-user-profile-picture-*.png',
        PROFILE_PICTURE_ORIENTATION: 'squarish', // 'landscape' | 'portrait' | 'squarish'
        PROFILE_PICTURE_WIDTH: 2000,
        PROFILE_PICTURE_HEIGHT: 2000,
        PROFILE_PICTURE_COUNT: 5,
    },
    COMPANIES: {
        TOTAL: 10,
        EMAIL_LOCAL: 'support',
        DESCRIPTION_PHRASES: 30,
        DEFAULT_LOGO: 'default-logo.png',
        LOGO_MASK: 'company-logo-*.png',
        LOGO_WIDTH: 2000,
        LOGO_HEIGHT: 2000,
        LOGO_QUERY_POSTFIX: 'logo branding abstract icon creative',
        LOGO_ORIENTATION: 'squarish', // 'landscape' | 'portrait' | 'squarish'
        GENERATE_LOGOS: false,
    },
    EVENTS: {
        TOTAL: 30,
        DEFAULT_POSTER: 'default-poster.png',
        POSTER_MASK: 'event-poster-*.jpg',
        POSTER_WIDTH: 2000,
        POSTER_HEIGHT: 3000,
        POSTER_QUERY_POSTFIX: 'abstract event poster creative',
        POSTER_ORIENTATION: 'portrait', // 'landscape' | 'portrait' | 'squarish'
        GENERATE_POSTERS: false,
        GENERATED_POSTERS_COUNT: 30,
        MIN_THEMES_PER_EVENT: 1,
        MAX_THEMES_PER_EVENT: 3,
        DESCRIPTION_PHRASES: 20,
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
        TOTAL: 15, // max formats count = 80
    },
    THEMES: {
        TOTAL: 50, // max themes count = 119
    },
    TICKETS: {
        NUMBER_PREFIX: 'TICKET',
        MIN_PER_EVENT: 10,
        MAX_PER_EVENT: 100,
        PRICE_MULTIPLE_OF: 10,
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
        CODES: ['SPRING10', 'UNIVENT20', 'BIRTHDAY30'],
        DISCOUNT: {
            MIN: 0.1,
            MAX: 0.5,
        },
        TITLE_PREFIX: 'Univent Promo for Event',
    },
    EVENT_ATTENDEES: {
        MIN_PER_EVENT: 3,
        MAX_PER_EVENT: 10,
        VISIBILITY: {
            HIDDEN_THRESHOLD: 8,
        },
    },
    ORDERS: {
        TOTAL: 50,
        CREATED_AT: {
            MIN_DAYS: 1,
            MAX_DAYS: 30,
        },
        STATUS_WEIGHTS: {
            PENDING: 100,
            PAID: 0,
            FAILED: 0,
            REFUNDED: 0,
        },
        PAYMENT_METHOD_WEIGHTS: {
            STRIPE: 70
        },
        DISCOUNT_PROBABILITY: 0.5,
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
    NOTIFICATIONS: {
        EVENT: {
            STATUS_CHANGE: {
                TITLE: 'Event status updated',
                WEIGHTS: {
                    SALES_STARTED: 30,
                    ONGOING: 20,
                    FINISHED: 20,
                    CANCELLED: 10,
                    PUBLISHED: 20,
                },
            },
            START_DATE_CHANGE: {
                TITLE: 'Event start date postponed',
                MIN_DAYS_SHIFT: 1,
                MAX_DAYS_SHIFT: 14,
            },
            TICKETS_SALE_DATE_CHANGE: {
                TITLE: 'Ticket sales start date postponed',
                MIN_DAYS_SHIFT: 1,
                MAX_DAYS_SHIFT: 7,
            },
            VENUE_CHANGE: {
                TITLE: 'Event venue updated',
            },
            CREATION: {
                TITLE: 'New event published',
            },
            NEWS: {
                TITLE: 'Event news published',
            },
            ATTENDEE: {
                TITLE: 'New event attendee joined',
            },
        },
        COMPANY: {
            NEWS: {
                TITLE: 'Company news published',
            },
        },
        READ_PROBABILITY: 0.7,
        HIDDEN_PROBABILITY: 0.3,
        DATES: {
            MIN_DAYS_AGO: 1,
            MAX_DAYS_AGO: 30,
        },
    },
} as const;
