// src/models/companies/dto/create-company.dto.ts
import { IsEnglishName } from '../../../../common/validators/name.validator';

export class CreateEventThemeDto {
    @IsEnglishName(false)
    title: string;
}
