// src/tickets/guards/event-creator.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from '../tickets.service';

@Injectable()
export class EventCreatorGuard implements CanActivate {
    constructor(private readonly ticketsService: TicketsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user.userId;
        const ticketId = request.params?.id;
        const eventId =
            request.body?.eventId ||
            (ticketId &&
                (await this.ticketsService.findOne(ticketId, userId))?.eventId);

        if (!eventId) {
            throw new ForbiddenException('Event ID is required');
        }

        // const isCreator = await this.ticketsService.isEventCreator(eventId, userId);//TODO: isEventCreator should be in ticketService or eventService?
        // if (!isCreator) {
        //   throw new ForbiddenException('You are not the creator of this event');
        // }

        return true;
    }
}
