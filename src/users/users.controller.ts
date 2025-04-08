// src/users/users.controller.ts
import {
    Controller,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Post,
    Body,
    Req,
    NotImplementedException,
    Param,
    Patch,
    Delete,
    UseGuards,
    Get,
    SerializeOptions,
    Query,
    UsePipes,
    ValidationPipe, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { SERIALIZATION_GROUPS, User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import { createFileUploadInterceptor } from '../common/interceptor/file-upload.interceptor';
import { AvatarConfig } from '../config/avatar.config';
import { OwnAccountGuard } from './guards/own-account.guard';
import { UserId } from './decorators/user.decorator';
import {
    ApiBody,
    ApiConsumes,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam, ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@SerializeOptions({
    groups: SERIALIZATION_GROUPS.BASIC,
})
@ApiTags('Users')
export class UsersController extends BaseCrudController<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    protected async findById(id: number, userId: number): Promise<User> {
        return await this.usersService.getUserByIdWithoutPassword(id);
    }

    protected async createEntity(
        dto: CreateUserDto,
        userId: number,
    ): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserDto,
        userId: number,
    ): Promise<User> {
        return await this.usersService.updateUser(id, dto);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    @Post()
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({ type: CreateUserDto, description: 'User registration data' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful registration',
        type: User,
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
                    example: 'Email already in use',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
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
    async create(
        @Body() dto: CreateUserDto,
        @UserId() userId: number,
    ): Promise<User> {
        throw new NotImplementedException();
    }

    @Get()
    @ApiOperation({ summary: 'Get user data' })
    @ApiQuery({
        name: 'email',
        required: true,
        type: String,
        description: 'Email address of the user to retrieve',
        example: 'ann.nichols@gmail.ua',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: User
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
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
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
                },
            },
        },
    })
    async findOne(@Query('email') email: string): Promise<User> {
        if (!email) {
            throw new BadRequestException('Email parameter is required');
        }

        return await this.usersService.getUserByEmailWithoutPassword(email);
    }

    @Get()
    @ApiOperation({ summary: 'Get user data' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID', example: 1 })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieve',
        type: User
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
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
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
                },
            },
        },
    })
    async getById(@Param('id') id: number, @UserId() userId: number): Promise<User> {
        const existing = await this.usersService.getUserByIdWithoutPassword(id);
        if (!existing) {
            throw new NotFoundException('User not found');
        }
        return existing;
    }

    @Patch(':id')
    @UseGuards(OwnAccountGuard)
    @ApiOperation({ summary: 'Update user data' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID', example: 1 })
    @ApiBody({ type: UpdateUserDto, description: 'User update data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully update',
        type: User
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
                    example: 'Email update is temporarily unavailable',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Old password does not match',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
                },
            },
        },
    })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateUserDto,
        @UserId() userId: number,
    ): Promise<User> {
        return super.update(id, dto, userId);
    }

    @Delete(':id')
    @UseGuards(OwnAccountGuard)
    @ApiExcludeEndpoint()
    async delete(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        return super.delete(id, userId);
    }

    @Post('upload-avatar')
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/avatars',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        }),
    )
    @ApiOperation({ summary: 'Upload user profile picture' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Avatar image file (e.g., PNG, JPEG)',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully upload',
        type: User
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
                    example: 'Invalid file format',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Old password does not match',
                },
            },
        },
    })
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        //TODO: add verification of file type. in case of error - throw BadRequestException
        //TODO: (not now) Delete old pictures (that a person just uploaded) do in Scheduler
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        return { server_filename: file.filename };
    }
}
