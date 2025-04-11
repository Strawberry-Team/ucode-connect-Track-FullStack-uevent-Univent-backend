// src/models/events/formats/dto/create-event-format.dto.ts
import { IsEnglishName } from '../../../../common/validators/name.validator';

export class CreateEventFormatDto {
    @IsEnglishName(false)
    title: string;
}
