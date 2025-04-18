// src/models/subscriptions/guards/subscription-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubscriptionsRepository } from '../subscriptions.repository';

@Injectable()
export class SubscriptionOwnerGuard implements CanActivate {
    constructor(
        private readonly subscriptionsRepository: SubscriptionsRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user.userId;
        const subscriptionId = parseInt(request.params.id, 10);

        if (isNaN(subscriptionId)) {
            throw new NotFoundException('Subscription not found');
        }

        const subscription = await this.subscriptionsRepository.findOneById(subscriptionId);

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        if (subscription.userId !== userId) {
            throw new ForbiddenException('You are not authorized to access this subscription');
        }

        return true;
    }
}
