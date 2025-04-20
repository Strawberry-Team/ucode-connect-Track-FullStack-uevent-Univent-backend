import { Prisma } from '@prisma/client';

export function convertDecimalsToNumbers(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertDecimalsToNumbers);
    } else if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (
                (typeof Prisma.Decimal !== 'undefined' && value instanceof Prisma.Decimal) ||
                (value && typeof value.toNumber === 'function')
            ) {
                result[key] = value.toNumber();
            }
            else if (value instanceof Date) {
                    result[key] = value;
            } else if (Array.isArray(value) || (value && typeof value === 'object')) {
                result[key] = convertDecimalsToNumbers(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return obj;
}
