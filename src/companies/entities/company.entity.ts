import { Company as PrismaCompany } from '@prisma/client';
import { Expose } from 'class-transformer';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
};

export class Company implements PrismaCompany {
    @Expose({ groups: ['basic'] })
    id: number;

    @Expose({ groups: ['basic'] })
    ownerId: number;

    @Expose({ groups: ['basic'] })
    email: string;

    @Expose({ groups: ['basic'] })
    title: string;

    @Expose({ groups: ['basic'] })
    description: string;

    @Expose({ groups: ['basic'] })
    logoName: string;

    @Expose({ groups: ['basic'] })
    createdAt: Date;

    @Expose({ groups: ['basic'] })
    updatedAt: Date;
}
