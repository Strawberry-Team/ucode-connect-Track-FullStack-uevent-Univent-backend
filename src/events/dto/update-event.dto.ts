import { ValidateEventDates } from "../validators/event-dates.validator";
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

@ValidateEventDates()
export class UpdateEventDto extends PartialType(CreateEventDto) {}