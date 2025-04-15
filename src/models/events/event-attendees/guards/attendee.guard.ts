import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { EventAttendeesService } from '../event-attendees.service';

@Injectable()
export class AttendeeGuard implements CanActivate {
  constructor(private readonly eventAttendeesService: EventAttendeesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const attendeeId = +request.params.id;

    const attendee = await this.eventAttendeesService.findById(attendeeId);
    if (attendee?.userId !== userId) {
      throw new ForbiddenException('You are not authorized to access this event');
    }

    return true;
  }
} 