import { Company } from '../entities/company.entity';
import { faker } from '@faker-js/faker';

export function generateFakeId(): number {
    return faker.number.int({min: 1, max: 100});
}

function generateFakeCompanyEmail(title: string): string {
    return faker.internet.email({
        firstName: '',
        lastName: "support",
        provider: title.toLowerCase().replace(" ", ".") + ".com",
        allowSpecialCharacters: false
    });
}

function generateFakeCompanyTitle(): string {
    return faker.company.name();
}

function generateFakeCompanyDescription(): string {
    return faker.company.catchPhrase();
}

export function generateFakeCompany<K extends keyof Company>(
    allFields = true,
    fields: K[] = []
): Pick<Company, K> {
    const title = generateFakeCompanyTitle();
    const fakeCompany: Company = {
        id: 1,
        ownerId: 1,
        email: generateFakeCompanyEmail(title),
        title: title,
        description: generateFakeCompanyDescription(),
        logoName: "default-logo.png",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    if (allFields) {
        return fakeCompany;
    }

    const company = {} as Pick<Company, K>;

    fields.forEach((field) => {
        company[field] = fakeCompany[field];
    });

    return company;
}

export function pickFields<T extends Company, K extends keyof T>(
    obj: T,
    fields: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;

    fields.forEach((field) => {
        if (field in obj) {
            result[field] = obj[field];
        }
    });

    return result;
}

