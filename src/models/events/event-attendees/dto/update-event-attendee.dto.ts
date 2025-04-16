// src/models/events/event-attendees/dto/update-event-attendee.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateEventAttendeeDto {
  @ApiProperty({
    description: 'Whether to display the user in the list of attendees',
    example: true,
  })
  @IsBoolean()
  isVisible: boolean;
} 