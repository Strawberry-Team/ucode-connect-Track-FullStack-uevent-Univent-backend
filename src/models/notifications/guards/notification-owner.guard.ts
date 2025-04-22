import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationOwnerGuard implements CanActivate {
  constructor(private readonly notificationsService: NotificationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const notificationId = parseInt(request.params.id, 10);

    if (!userId || isNaN(notificationId)) {
      throw new ForbiddenException('Invalid request');
    }

    const notification = await this.notificationsService.findById(notificationId);
    
    if (!notification) {
      return false;
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Only notification owner can perform this action');
    }

    return true;
  }
} 