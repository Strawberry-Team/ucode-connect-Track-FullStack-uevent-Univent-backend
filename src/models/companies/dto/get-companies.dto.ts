// src/models/companies/dto/get-companies.dto.ts
import { CompanyFilterDto } from "./company-filter.dto";
import { WithPagination } from "../../../common/mixins/with-pagination.mixin";

export class GetCompaniesDto extends WithPagination(CompanyFilterDto) {}
