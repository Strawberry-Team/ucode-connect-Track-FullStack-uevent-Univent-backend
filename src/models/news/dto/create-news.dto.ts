// scr/models/news/dto/create-news.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from '../../../common/validators/id.validator';
import { IsName } from '../../../common/validators/name.validator';
import { IsDescription } from '../../../common/validators/description.validator';

export class CreateNewsDto {
    @IsName(false)
    @ApiProperty({
        description: 'News title',
        required: true,
        nullable: false,
        type: 'string',
        example:
            'Boombox Concert in Dnipro Postponed Due to Adverse Weather Conditions',
    })
    title: string;

    @IsDescription(false)
    @ApiProperty({
        description: 'News description',
        required: true,
        nullable: false,
        type: 'string',
        example: `Dnipro, Ukraine – The highly anticipated concert by the Ukrainian band Boombox, originally scheduled for this weekend in Dnipro, has been postponed due to unfavorable weather conditions. The announcement was made by the event organizers earlier today, citing concerns for the safety and comfort of fans and performers.\nThe region has been experiencing heavy rainfall and strong winds, with forecasts indicating continued inclement weather over the coming days. To ensure a safe and enjoyable experience for all attendees, the decision was made to reschedule the event.\n"We are deeply disappointed to postpone this show, but the safety of our fans, crew, and the band is our top priority," said the organizers in a statement. "Boombox is excited to perform in Dnipro, and we’re working to confirm a new date as soon as possible."\nFans who purchased tickets for the original date are advised to hold onto them, as they will be valid for the rescheduled concert. Updates on the new date and any further details will be shared through Boombox’s official social media channels and the event’s ticketing platform.\nBoombox, known for their energetic performances and hits like "Vakhteram" and "Kvity v volossi," expressed their gratitude to fans for their understanding. "We can’t wait to bring our music to Dnipro and share an unforgettable night with you all," the band posted online.\nFor the latest information, fans are encouraged to check Boombox’s official website and social media for updates.\nStay tuned for more details, and thank you for your support!`,
    })
    description: string;
}
