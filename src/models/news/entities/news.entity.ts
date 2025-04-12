// scr/models/news/entities/news.entity.ts
import { News as PrismaNews } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Event } from '../../events/entities/event.entity';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
    SYSTEMIC: ['basic', 'confidential', 'systemic'],
};

export class News implements PrismaNews {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'News identifier',
        required: true,
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Author identifier',
        required: true,
        nullable: false,
        type: 'number',
        example: 1,
    })
    authorId: number;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Company identifier',
        required: true,
        nullable: true,
        type: 'number',
        example: 1,
    })
    companyId: number | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Event identifier',
        required: true,
        nullable: true,
        type: 'number',
        example: 1,
    })
    eventId: number | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'News title',
        required: true,
        nullable: false,
        type: 'string',
        example:
            'Boombox Concert in Dnipro Postponed Due to Adverse Weather Conditions',
    })
    title: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'News description',
        required: true,
        nullable: false,
        type: 'string',
        example: `Dnipro, Ukraine – The highly anticipated concert by the Ukrainian band Boombox, originally scheduled for this weekend in Dnipro, has been postponed due to unfavorable weather conditions. The announcement was made by the event organizers earlier today, citing concerns for the safety and comfort of fans and performers.\nThe region has been experiencing heavy rainfall and strong winds, with forecasts indicating continued inclement weather over the coming days. To ensure a safe and enjoyable experience for all attendees, the decision was made to reschedule the event.\n"We are deeply disappointed to postpone this show, but the safety of our fans, crew, and the band is our top priority," said the organizers in a statement. "Boombox is excited to perform in Dnipro, and we’re working to confirm a new date as soon as possible."\nFans who purchased tickets for the original date are advised to hold onto them, as they will be valid for the rescheduled concert. Updates on the new date and any further details will be shared through Boombox’s official social media channels and the event’s ticketing platform.\nBoombox, known for their energetic performances and hits like "Vakhteram" and "Kvity v volossi," expressed their gratitude to fans for their understanding. "We can’t wait to bring our music to Dnipro and share an unforgettable night with you all," the band posted online.\nFor the latest information, fans are encouraged to check Boombox’s official website and social media for updates.\nStay tuned for more details, and thank you for your support!`,
    })
    description: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'News publication date',
        required: true,
        nullable: false,
        type: 'string',
        example: '2025-04-11T15:53:12.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['systemic'] })
    updatedAt: Date;

    @Expose({ groups: ['confidential'] })
    author?: User;

    @Expose({ groups: ['basic'] })
    company?: Company;

    @Expose({ groups: ['basic'] })
    event?: Event;
}
