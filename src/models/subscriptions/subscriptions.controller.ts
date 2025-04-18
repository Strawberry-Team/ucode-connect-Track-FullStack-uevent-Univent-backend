// src/models/subscriptions/subscriptions.controller.ts
import {
    Controller,
    Post,
    Body,
    Delete,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiParam, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { UserId } from '../../common/decorators/user.decorator';
import {
    SubscriptionWithConfidential, SubscriptionWithConfidentialWithoutCompanyId,
    SubscriptionWithConfidentialWithoutEventId,
} from './entities/subscription.entity';
import { SubscriptionOwnerGuard } from './guards/subscription-owner.guard';

@UseGuards(JwtAuthGuard)
@ApiExtraModels(SubscriptionWithConfidentialWithoutEventId, SubscriptionWithConfidentialWithoutCompanyId)
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create subscription to event or company' })
    @ApiBody({
        required: true,
        type: CreateSubscriptionDto,
        description: 'Subscription creation data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Subscription successfully created',
        schema: {
            oneOf: [
                {
                    $ref: getSchemaPath(SubscriptionWithConfidentialWithoutEventId),
                    description: 'Returned when subscribing to a company (entityType = COMPANY)'
                },
                {
                    $ref: getSchemaPath(SubscriptionWithConfidentialWithoutCompanyId),
                    description: 'Returned when subscribing to an event (entityType = EVENT)'
                }
            ]
        }
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
                    example: 'Invalid entity type',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'HTTP status code',
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
        status: HttpStatus.NOT_FOUND,
        description: 'Entity not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Event not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User is already subscribed to this entity',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User is already subscribed to this entity',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
    async create(
        @UserId() userId: number,
        @Body() createSubscriptionDto: CreateSubscriptionDto,
    ): Promise<
        | SubscriptionWithConfidentialWithoutEventId
        | SubscriptionWithConfidentialWithoutCompanyId
    > {
        return this.subscriptionsService.create(userId, createSubscriptionDto);
    }

    @Delete(':id')
    @UseGuards(SubscriptionOwnerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a subscription' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Subscription identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Successfully deletion',
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
                    example:
                        'You are not authorized to access this subscription',
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
        description: 'Subscription not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Subscription not found',
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
    async remove(
        @Param('id') id: number,
    ): Promise<void> {
        return await this.subscriptionsService.delete(id);
    }
}
