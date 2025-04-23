// src/models/companies/dto/get-companies.dto.ts
// import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
// import { CreateCompanyDto } from "./create-company.dto";
// import { PaginationQueryDto } from "../../../models/common/dto/pagination.query.dto";
// // import { PaginationDto } from "./pagination.dto";
import { CompanyFilterDto } from "./company-filter.dto";
import { WithPagination } from "../../../common/mixins/with-pagination.mixin";

export class GetCompaniesDto extends WithPagination(CompanyFilterDto) {}

// export interface GetCompaniesDto extends 
//     Partial<Pick<CreateCompanyDto, 'title' | 'description'>>, 
//     PaginationQueryDto {}

// // export class GetCompaniesDto extends PartialType(
// //     PickType(CreateCompanyDto, [
// //         'title',
// //         'description',
// //     ])
// export class GetCompaniesDto implements GetCompaniesDto {
//     @ApiProperty({
//         required: false,
//         description: 'Filter companies by email',
//         type: 'string',
//         nullable: false,
//         example: 'open',
//     })
//     email?: string;

//     @ApiProperty({
//         required: false,
//         description: 'Filter companies by title',
//         type: 'string',
//         nullable: true,
//         example: 'Open',
//     })
//     title?: string;

//     @ApiProperty({
//         required: false,
//         description: 'Filter companies by description',
//         type: 'string',
//         nullable: true,
//         example: 'user',
//     })
//     description?: string;

//     // @ApiProperty({
//     //     required: false,
//     //     description: 'Pagination parameters',
//     //     type: PaginationQueryDto
//     // })
//     // pagination?: PaginationQueryDto;
// }