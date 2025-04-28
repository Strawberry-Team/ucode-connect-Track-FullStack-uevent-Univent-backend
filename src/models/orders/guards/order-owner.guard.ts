// src/models/orders/guards/order-owner.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { OrdersService } from '../orders.service';

@Injectable()
export class OrderOwnerGuard implements CanActivate {
    constructor(private readonly ordersService: OrdersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const orderIdParam = request.params.id;

        const orderId = parseInt(orderIdParam, 10);
        if (isNaN(orderId)) {
            throw new BadRequestException('Invalid Order ID format.');
        }

        const order = await this.ordersService.getOrder(orderId, user.userId);

        if (user.userId !== order.userId) {
            throw new ForbiddenException(
                'You do not have permission to access tickets for this order.',
            );
        }

        return true;
    }
}
