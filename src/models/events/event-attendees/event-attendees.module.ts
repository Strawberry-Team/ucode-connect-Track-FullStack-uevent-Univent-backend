// src/models/events/event-attendees/event-attendees.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventAttendeesService } from './event-attendees.service';
import { EventAttendeesController } from './event-attendees.controller';
import { UsersModule } from 'src/models/users/users.module';
import { EventsModule } from '../events.module';
import { EventAttendeesRepository } from './event-attendees.repository';

@Module({
  providers: [EventAttendeesService, EventAttendeesRepository],
  controllers: [EventAttendeesController],
  exports: [EventAttendeesService, EventAttendeesRepository],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => EventsModule),
],
})
export class EventAttendeesModule {}
