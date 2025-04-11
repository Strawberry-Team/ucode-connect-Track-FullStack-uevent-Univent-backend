// src/models/news/news.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { BaseCrudController } from '../../common/controller/base-crud.controller';
import { News } from './entities/news.entity';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { Company } from '../companies/entities/company.entity';
import { UpdateCompanyDto } from '../companies/dto/update-company.dto';
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorator';
import { CompanyOwnerGuard } from '../companies/guards/company-owner.guard';

@Controller('news')
export class NewsController extends BaseCrudController<
    News,
    CreateNewsDto,
    UpdateNewsDto
> {
    constructor(private readonly newsService: NewsService) {
        super();
    }

    protected async createEntity(
        dto: CreateNewsDto,
        userId: number,
    ): Promise<News> {
        return await this.newsService.create(dto, userId);
    }

    protected async findById(id: number, userId: number): Promise<News> {
        return await this.newsService.findById(id);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateNewsDto,
        userId: number,
    ): Promise<News> {
        return await this.newsService.update(id, dto);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        await this.newsService.delete(id);
    }

    @Post()
    @ApiOperation({ summary: 'Company creation' })
    @ApiBody({
        required: true,
        type: CreateNewsDto,
        description: 'News creation data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful news creation',
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
    async create(@Body() dto: CreateNewsDto, @UserId() userId: number) {
        return super.create(dto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all news data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of news',
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
    async findAll() {
        return this.newsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get news data by id' })
    @ApiParam({
        name: 'id',
        required: true,
        type: 'number',
        description: 'News ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: News,
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
        description: 'News not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News not found',
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
    async findOne(@Param('id') id: number, @UserId() userId: number) {
        return super.findOne(id, userId);
    }

    @Patch(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Update news data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'News ID',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateNewsDto,
        description: 'News update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: News,
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
                    example: 'Only the news owner has access to it',
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
        description: 'News not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News not found',
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
        @Body() dto: UpdateNewsDto,
        @UserId() userId: number,
    ) {
        return super.update(id, dto, userId);
    }

    @Delete(':id')
    @UseGuards(CompanyOwnerGuard)
    @ApiOperation({ summary: 'Delete news data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'News ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: News,
        description: 'Successfully remove',
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
                    example: 'Only the news owner has access to it',
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
        description: 'News not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'News not found',
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
    async remove(@Param('id') id: number, @UserId() userId: number) {
        return super.remove(id, userId);
    }
}
