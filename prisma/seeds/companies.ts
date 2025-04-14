// prisma/seeds/companies.ts
import { faker } from '@faker-js/faker';
import { SEED_COUNTS } from './seed-constants';

export const initialCompanies = [
    ...Array.from({ length: SEED_COUNTS.COMPANIES.TOTAL }, (_, index) => {
        const userId = index + 2;
        const title = faker.company.catchPhraseAdjective();
        
        return {
            ownerId: userId,
            email: faker.internet.email({
                firstName: 'customer',
                lastName: 'support',
                provider: title.toLowerCase().replace(/\s+/g, ''),
                allowSpecialCharacters: false,
            }),
            title: title,
            description: Array.from(
                { length: SEED_COUNTS.COMPANIES.DESCRIPTION_PHRASES }, 
                () => faker.company.catchPhrase()
            ).join('. ') + '.',
            logoName: 'default-logo.png',
        };
    }),
]; 