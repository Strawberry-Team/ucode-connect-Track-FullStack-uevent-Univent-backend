// src/models/events/formats/dto/create-format.dto.ts
import { IsEnglishName } from '../../../../common/validators/name.validator';

export class CreateFormatDto {
    @IsEnglishName(false)
    title: string;
}
