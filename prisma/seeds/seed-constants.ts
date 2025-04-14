// prisma/seeds/seed-constants.ts
export const SEED_COUNTS = {
  PRODUCT:{
    DOMAIN: 'uevent.com',
  },
  USERS: {
    TOTAL: 30,
    ADMINS: 1,
  },
  COMPANIES: {
    TOTAL: 10,
    DESCRIPTION_PHRASES: 7,
  },
  EVENTS: {
    TOTAL: 30,
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
  },
  FORMATS: 8,
  THEMES: 8,
  TICKETS: {
    MIN_PER_EVENT: 10,
    MAX_PER_EVENT: 100,
    TYPES: {
      STANDARD: {
        MIN_PRICE: 200,
        MAX_PRICE: 500,
      },
      VIP: {
        MIN_PRICE: 800,
        MAX_PRICE: 2000,
      },
      PREMIUM: {
        MIN_PRICE: 2500,
        MAX_PRICE: 5000,
      },
    },
  },
  NEWS: {
    MIN_PER_COMPANY: 1,
    MAX_PER_COMPANY: 5,
    MIN_PER_EVENT: 0,
    MAX_PER_EVENT: 3,
    DESCRIPTION: {
      MIN_PARAGRAPHS: 2,
      MAX_PARAGRAPHS: 4,
    },
  },
} as const; 