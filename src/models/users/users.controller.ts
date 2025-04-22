// src/models/users/users.controller.ts
import {
    Controller,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Get,
    Query,
    HttpStatus, NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
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
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    OmitType,
} from '@nestjs/swagger';
import { GetUsersDto } from './dto/get-users.dto';
import { Company } from '../companies/entities/company.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import {Order} from "../orders/entities/order.entity";
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionWithCompanies, SubscriptionWithEvents } from '../subscriptions/entities/subscription.entity';
import {OrdersService} from "../orders/orders.service";
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../notifications/entities/notification.entity';
// TODO create get user events route
@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly ordersService: OrdersService,
        private readonly notificationsService: NotificationsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get current user data' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully retrieved current user profile',
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
    async findMe(@UserId() userId: number): Promise<User> {
        return await this.usersService.findUserByIdWithConfidential(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: () => OmitType(User, ['role']),
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
    async findOne(@Param('id') id: number): Promise<User> {
        return await this.usersService.findUserByIdWithoutPassword(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: () => OmitType(User, ['role']),
        isArray: true,
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
                },
            },
        },
    })
    async findAll(@Query() getUsersDto: GetUsersDto): Promise<User[]> {
        // TODO: переписать на findOne с email/:email
        return await this.usersService.findAllUsers(getUsersDto);
    }

    @Get(':id/companies')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user companies' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Company,
        isArray: true,
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
    async findUserCompanies(@Param('id') id: number): Promise<Company[]> {
        return await this.usersService.findUserCompanies(id);
    }

    @Get(':id/subscriptions/events')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user event subscriptions' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SubscriptionWithEvents,
        isArray: true,
        description: 'Successfully retrieved user event subscriptions',
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
    async findUserEventSubscriptions(
        @Param('id') id: number,
    ): Promise<SubscriptionWithEvents[]> {
        return await this.subscriptionsService.findAllByUserIdForEvents(id);
    }

    @Get(':id/subscriptions/companies')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user company subscriptions' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SubscriptionWithCompanies,
        isArray: true,
        description: 'Successfully retrieved user company subscriptions',
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
    async findUserCompanySubscriptions(
        @Param('id') id: number,
    ): Promise<SubscriptionWithCompanies[]> {
        return await this.subscriptionsService.findAllByUserIdForCompanies(id);
    }

    @Patch(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Update user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateUserDto,
        description: 'User update data',
    })
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
                    example: [
                        'firstName must match /^[a-zA-Z-]+$/ regular expression',
                    ],
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
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateUserDto,
        @UserId() userId: number,
    ): Promise<User> {
        return await this.usersService.updateUser(id, dto);
    }

    @Patch(':id/password')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Update user password data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateUserPasswordDto,
        description: 'User password update data',
    })
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
                    example: [
                        'oldPassword is not strong enough',
                        'newPassword is not strong enough',
                    ],
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
            destination: './public/uploads/user-avatars',
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
        description: 'User identifier',
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
                    description: 'Filename for the uploaded avatar',
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
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: number,
    ): Promise<{ server_filename: string }> {
        //TODO: add verification of file type. in case of error - throw BadRequestException
        //TODO: (not now) Delete old pictures (that a person just uploaded) do in Scheduler
        if (!file) {
            throw new BadRequestException(
                'Invalid file format or missing file',
            );
        }

        this.usersService.updateUserAvatar(id, file.filename);

        return { server_filename: file.filename };
    }

    @Get(':id/orders')
    async findUserOrders(
        @Param('id') id: number,
    ): Promise<Order[]> {
        const user = await this.usersService.findUserById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return await this.ordersService.findOrdersWithDetailsByUserId(id);
    }

    @Get(':id/notifications')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Notification,
        isArray: true,
        description: 'Successfully retrieved user notifications',
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

    async getNotifications(@Param('id') id: number): Promise<Notification[]> {
        return this.notificationsService.findAll(id);
    }
}
