import {
    Controller,
    Post,
    Body,
    UseGuards, Get, Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { UserId } from '../../common/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
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
    @ApiOperation({ summary: 'Create a new orders' })
    @ApiResponse({
        status: 201,
        description: '',
        type: Order,
    })
    async getOrder(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<Order> {
        return this.ordersService.getOrder(id, userId);
    }
}
