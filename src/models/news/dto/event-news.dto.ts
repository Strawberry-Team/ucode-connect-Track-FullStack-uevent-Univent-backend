// scr/models/news/dto/event-news.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { News } from '../entities/news.entity';

export class EventNewsDto extends PartialType(News) {
    @ApiProperty({
        description: 'Company identifier',
        nullable: true,
        type: 'null',
        example: null,
    })
    companyId: null;
}
