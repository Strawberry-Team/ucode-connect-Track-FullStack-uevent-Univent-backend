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
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
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
    private frontUrl: string;

    constructor(
        private readonly companyService: CompaniesService,
        private readonly userService: UsersService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.frontUrl = String(
            this.configService.get<string>('app.frontendLink'),
        );
    }

    protected async findById(id: number): Promise<Company> {
        return await this.companyService.findCompanyById(id);
    }

    protected async createEntity(dto: CreateCompanyDto): Promise<Company> {
        return await this.companyService.createCompany(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateCompanyDto,
    ): Promise<Company> {
        return await this.companyService.updateCompany(id, dto);
    }

    protected async deleteEntity(id: number): Promise<void> {
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
                    type: 'string',
                    description: 'Error message',
                    example: 'Company email must be not empty',
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
                    example: 'Invalid or expired refresh token',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Company owner not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Company owner not found',
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
            },
        },
    })
    async create(@Body() dto: CreateCompanyDto, @UserId() userId: number) {
        const company = await super.create(dto, userId);
        const owner = await this.userService.getUserById(company.ownerId);

        this.emailService.sendWelcomeCompanyEmail(
            owner.email,
            `${owner.firstName} ${owner.lastName}`,
            company.title,
            this.frontUrl,
        );

        return company;
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
                    example: 'Invalid or expired refresh token',
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
                    example: 'Invalid or expired refresh token',
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
                    type: 'string',
                    description: 'Error message',
                    example: 'Company email must be not empty',
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
                    example: 'Company data can be updated only by its owner',
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
                    example: 'Company email already in use',
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
                    example: 'Invalid file format or missing file',
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
                    example: 'Company logo can be updated only by its owner',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'File data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Filename already in use',
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
