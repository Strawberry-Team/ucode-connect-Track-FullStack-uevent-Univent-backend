// scr/models/news/dto/company-news.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { News } from '../entities/news.entity';

export class CompanyNewsDto extends PartialType(News) {
    @ApiProperty({
        description: 'Event identifier',
        nullable: true,
        type: 'null',
        example: null,
    })
    eventId: null;
}
