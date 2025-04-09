import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotImplementedException,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { UserId } from '../users/decorators/user.decorator';
import { createFileUploadInterceptor } from '../common/interceptor/file-upload.interceptor';
import { AvatarConfig } from '../config/avatar.config';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import {
    ApiBody,
    ApiConsumes,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';

@Controller('companies')
@ApiTags('Companies')
@ApiSecurity('JWT')
export class CompaniesController extends BaseCrudController<
    Company,
    CreateCompanyDto,
    UpdateCompanyDto
> {
    constructor(private readonly companyService: CompaniesService) {
        super();
    }

    protected async findById(id: number, userId: number): Promise<Company> {
        return await this.companyService.findCompanyById(id);
    }

    protected async createEntity(
        dto: CreateCompanyDto,
        userId: number,
    ): Promise<Company> {
        return await this.companyService.createCompany(dto, userId);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateCompanyDto,
        userId: number,
    ): Promise<Company> {
        return await this.companyService.updateCompany(id, dto);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        await this.companyService.removeCompany(id);
    }

    @Post()
    @ApiOperation({ summary: 'Company creation' })
    @ApiBody({
        required: true,
        type: CreateCompanyDto,
        description: 'Company registration data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful company registration',
        type: Company,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'email must be an email',
                        'title must be shorter than or equal to 100 characters',
                        'description must be shorter than or equal to 1000 characters',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                status: {
                    type: 'number',
                    description: 'Error message',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Company data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User already has a company',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Conflict',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 409,
                },
            },
        },
    })
    async create(@Body() dto: CreateCompanyDto, @UserId() userId: number) {
        return super.create(dto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all companies data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of companies',
        type: [Company],
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Companies not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Companies not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                }
            },
        },
    })
    async findAll() {
        return this.companyService.findAllCompanies();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get company data' })
    @ApiParam({
        required: false,
        name: 'id',
        type: 'number',
        description: 'Company ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: Company,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Company not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Company not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                }
            },
        },
    })
    async getById(@Param('id') id: number, @UserId() userId: number) {
        return super.getById(id, userId);
    }

    @Patch(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Update company data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Company ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateCompanyDto,
        description: 'Company update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Company,
        description: 'Successfully update',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'title must be shorter than or equal to 100 characters',
                        'description must be shorter than or equal to 1000 characters',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                status: {
                    type: 'number',
                    description: 'Error message',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Only the company owner has access to it',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Company not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Company not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateCompanyDto,
        @UserId() userId: number,
    ) {
        return super.update(id, dto, userId);
    }

    @Delete(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiExcludeEndpoint()
    async delete(@Param('id') id: number, @UserId() userId: number) {
        throw new NotImplementedException();
    }

    @Post(':id/upload-logo')
    @UseGuards(CompanyOwnerGuard)
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/company-logos',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        }),
    )
    @ApiOperation({ summary: 'Upload company logo' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'Company ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Logo image file (e.g., PNG, JPEG). Example: "google-logo.png" (max size: 5MB)',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Logo successfully uploaded',
        schema: {
            type: 'object',
            properties: {
                server_filename: {
                    type: 'string',
                    description: 'Filename for the uploaded logo',
                    example: 'google-logo.png',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Only allowed file types are accepted!',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'You can only access your own account',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    async uploadLogo(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        if (!file) {
            throw new BadRequestException(
                'Invalid file format or missing file',
            );
        }

        await this.companyService.updateCompanyLogo(id, file.filename);

        return { server_filename: file.filename };
    }
}
