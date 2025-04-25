// src/models/notifications/notifications.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationOwnerGuard } from './guards/notification-owner.guard';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserId } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, NotificationOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update one user notification status' })
  @ApiParam({ name: 'id', type: Number, description: 'Notification ID' })
  @ApiBody({ type: UpdateNotificationDto, description: 'Update notification status' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully', type: Notification })
  @ApiResponse({ status: 403, description: 'Only the recipient of notifications can change their status' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificationDto,
    @UserId() userId: number,
  ): Promise<Notification> {
    return this.notificationsService.updateNotification(id, userId, dto);
  }
}
