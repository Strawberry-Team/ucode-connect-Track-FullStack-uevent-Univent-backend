import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    SerializeOptions,
    NotImplementedException,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { SERIALIZATION_GROUPS, Company } from './entities/company.entity';
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

@Controller('companies')
@SerializeOptions({
    groups: SERIALIZATION_GROUPS.BASIC,
})
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
    async findAll() {
        return this.companyService.findAllCompanies();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.companyService.findCompanyById(id);
    }

    @Patch(':id')
    @UseGuards(CompanyOwnerGuard)
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateCompanyDto,
        @UserId() userId: number,
    ) {
        return super.update(id, dto, userId);
    }

    @Delete(':id')
    @UseGuards(CompanyOwnerGuard)
    async remove(@Param('id') id: number, @UserId() userId: number) {
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
    async uploadLogo(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }

        await this.companyService.updateCompanyLogo(id, file.filename);

        return { server_filename: file.filename };
    }
}
