import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WithPagination } from '../../../common/mixins/with-pagination.mixin';
import { IsISO8601Date } from 'src/common/validators/date.validator';

export class GetNotificationsDto extends WithPagination(class {}) {
    @IsISO8601Date(true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Filter notifications by read date',
        type: 'string',
        nullable: true,
        example: '2025-05-01T00:00:00.000Z'
    })
    readAt?: Date;

    @IsISO8601Date(true)
    @Type(() => Date)
    @ApiProperty({
        required: false,
        description: 'Filter notifications by hidden date',
        type: 'string',
        nullable: true,
        example: '2025-05-01T00:00:00.000Z'
    })
    hiddenAt?: Date;
} 