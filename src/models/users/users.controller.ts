// src/models/users/users.controller.ts
import {
    Controller,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Post,
    Body,
    NotImplementedException,
    Param,
    Patch,
    Delete,
    UseGuards,
    Get,
    SerializeOptions,
    Query,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { BaseCrudController } from '../../common/controller/base-crud.controller';
import { SERIALIZATION_GROUPS, User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import { createFileUploadInterceptor } from '../../common/interceptor/file-upload.interceptor';
import { AvatarConfig } from '../../config/avatar.config';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { UserId } from '../../common/decorators/user.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import {
    ApiBody,
    ApiConsumes,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@SerializeOptions({
    groups: SERIALIZATION_GROUPS.BASIC,
})
@ApiTags('Users')
@ApiSecurity('JWT')
export class UsersController extends BaseCrudController<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    protected async createEntity(
        dto: CreateUserDto,
        userId: number,
    ): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async findById(id: number, userId: number): Promise<User> {
        return await this.usersService.findUserByIdWithoutPassword(id);
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
    @ApiExcludeEndpoint()
    async create(
        @Body() dto: CreateUserDto,
        @UserId() userId: number,
    ): Promise<User> {
        throw new NotImplementedException();
        // const user: User = await super.create(dto, userId);
        // this.authService.sendConfirmationEmailAndNewPassword(user);
        // return user;
    }

    // TODO create get user events route

    @Get(':id')
    @ApiOperation({ summary: 'Get user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully retrieve',
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
                }
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
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404
                }
            },
        },
    })
    async findOne(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<User> {
        const existing = await this.usersService.findUserByIdWithoutPassword(id);
        if (!existing) {
            throw new NotFoundException('User not found');
        }
        return existing;
    }

    @Get()
    @ApiOperation({ summary: 'Get user data' })
    @ApiQuery({
        name: 'email',
        required: true,
        type: 'string',
        description: 'Email address of the user to retrieve',
        example: 'ann.nichols@gmail.ua',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully retrieve',
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
                    example: 401
                }
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
                    example: 'User with this email not found',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404
                }
            },
        },
    })
    async findOneByEmail(@Query('email') email: string): Promise<User> {
        if (!email) {
            throw new BadRequestException('Email parameter is required');
        }

        return await this.usersService.findUserByEmailWithoutPassword(email);
    }

    @Patch(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Update user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User ID',
        example: 1,
    })
    @ApiBody({ required: true, type: UpdateUserDto, description: 'User update data' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
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
                    example: 'Email update is temporarily unavailable',
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
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User email already in use',
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

    @Patch(':id/password')
    @UseGuards(AccountOwnerGuard)
    async updatePassword(
        @Param('id') id: number,
        @Body() dto: UpdateUserPasswordDto,
    ): Promise<User> {
        return this.usersService.updateUserPassword(id, dto);
    }

    @Post(':id/upload-avatar')
    @UseGuards(AccountOwnerGuard)
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/avatars',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        }),
    )
    @ApiOperation({ summary: 'Upload user profile picture' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User ID',
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
                        'Avatar image file (e.g., PNG, JPEG). Example: "avatar.png" (max size: 5MB)',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Avatar successfully uploaded',
        schema: {
            type: 'object',
            properties: {
                server_filename: {
                    type: 'string',
                    description:
                        'Filename for the uploaded avatar',
                    example: 'avatar.png',
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
                message: { type: 'string', example: 'Only allowed file types are accepted!' },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 400,
                }
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
                }
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
                }
            },
        },
    })
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: number,
    ): Promise<{ server_filename: string }> {
        //TODO: add verification of file type. in case of error - throw BadRequestException
        //TODO: (not now) Delete old pictures (that a person just uploaded) do in Scheduler
        if (!file) {
            throw new BadRequestException('Invalid file format or missing file');
        }

        this.usersService.updateUserAvatar(id, file.filename);

        return { server_filename: file.filename };
    }

    @Delete(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiExcludeEndpoint()
    async remove(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        throw new NotImplementedException();
        // return super.delete(id, userId);
    }
}
