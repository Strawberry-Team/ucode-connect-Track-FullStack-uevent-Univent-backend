import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Param,
    StreamableFile,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { UserId } from '../../common/decorators/user.decorator';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDto } from './dto/get-orders-dto';
import { OrderOwnerGuard } from './guards/order-owner.guard';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new orders' })
    @ApiResponse({
        status: 201,
        description: 'Order has been successfully created',
        type: Order,
    })
    async create(
        @Body() dto: CreateOrderDto,
        @UserId() userId: number,
    ): Promise<Order> {
        return this.ordersService.create(dto, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get the order' })
    @ApiResponse({
        status: 200,
        description: 'Get the order',
        type: OrderDto,
    })
    async getOrder(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<Order> {
        return this.ordersService.getOrder(id, userId);
    }

    @Get(':id/items/:itemId/ticket')
    @UseGuards(JwtAuthGuard, OrderOwnerGuard)
    @ApiOperation({ summary: 'View ticket PDF for a specific order item' })
    @ApiParam({
        name: 'id',
        description: 'ID of the order containing the item',
        type: Number,
    })
    @ApiParam({
        name: 'itemId',
        description: 'ID of the order item (ticket)',
        type: Number,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns the ticket PDF file for inline display',
        content: { 'application/pdf': {} },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid Order ID or Item ID format',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid Order ID or Item ID format',
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
        status: HttpStatus.FORBIDDEN,
        description:
            'Forbidden (User does not own the order OR payment not completed)',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example:
                        'User does not own the order or payment not completed',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
        description: 'Order not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Order not found',
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
    async viewTicketPdf(
        @Param('id') orderId: number,
        @Param('itemId') itemId: number,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const { fileStream, downloadFileName } =
            await this.ordersService.getTicketFileStream(orderId, itemId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${downloadFileName}"`,
        });

        return new StreamableFile(fileStream);
    }
}
