// prisma/seeds/companies.ts
import { faker } from '@faker-js/faker';
import { SEEDS } from './seed-constants';

function generateUniqueCompanyTitles(count: number): string[] {
    const titles = new Set<string>();

    while (titles.size < count) {
        titles.add(faker.company.catchPhraseAdjective());
    }

    return Array.from(titles);
}

export const initialCompanies = (() => {
    const companyTitles = generateUniqueCompanyTitles(SEEDS.COMPANIES.TOTAL);

    return companyTitles.map((title, index) => {
        const userId = index + 2;

        return {
            ownerId: userId,
            email: `${SEEDS.COMPANIES.EMAIL_LOCAL}@${title.toLowerCase().replace(/[^\w]/g, '.')}.com`,
            title: title,
            description:
                Array.from(
                    { length: SEEDS.COMPANIES.DESCRIPTION_PHRASES },
                    () => faker.company.catchPhrase(),
                ).join('. ') + '.',
            logoName: SEEDS.COMPANIES.DEFAULT_LOGO,
        };
    });
})();
