// src/models/companies/dto/update-company.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(
    OmitType(CreateCompanyDto, ['email']),
) {}
