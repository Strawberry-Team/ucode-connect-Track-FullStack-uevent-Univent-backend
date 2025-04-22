// src/models/notifications/notifications.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationOwnerGuard } from './guards/notification-owner.guard';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserId } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, NotificationOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification status' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully', type: Notification })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner of notification' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNotificationDto,
    @UserId() userId: number,
  ): Promise<Notification> {
    return this.notificationsService.updateNotification(id, userId, updateDto);
  }
}
