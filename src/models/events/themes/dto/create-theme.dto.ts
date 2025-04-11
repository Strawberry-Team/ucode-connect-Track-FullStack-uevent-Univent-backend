// src/models/companies/dto/create-company.dto.ts
import { IsEnglishName } from '../../../../common/validators/name.validator';

export class CreateThemeDto {
    @IsEnglishName(false)
    title: string;
}
