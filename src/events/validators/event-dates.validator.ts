import { 
    ValidationOptions, 
    ValidatorConstraint, 
    ValidatorConstraintInterface,
    ValidationArguments
} from 'class-validator';
import { EVENT_TIME_CONSTANTS, EVENT_CONSTANTS } from '../constants/event.constants';

@ValidatorConstraint({ name: 'eventDatesValidator', async: false })
export class EventDatesValidatorConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const obj = args.object as any;
        const startedAt = new Date(obj.startedAt);
        const endedAt = new Date(obj.endedAt);
        const publishedAt = obj.publishedAt ? new Date(obj.publishedAt) : new Date();
        const ticketsAvailableFrom = new Date(obj.ticketsAvailableFrom);

        if (endedAt <= startedAt) {
            return false;
        }

        if (endedAt.getTime() - startedAt.getTime() < EVENT_TIME_CONSTANTS.MIN_DURATION_MS) {
            return false;
        }

        if (ticketsAvailableFrom >= startedAt) {
            return false;
        }

        if (ticketsAvailableFrom < publishedAt) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const obj = args.object as any;
        const startedAt = new Date(obj.startedAt);
        const endedAt = new Date(obj.endedAt);
        const publishedAt = new Date(obj.publishedAt);
        const ticketsAvailableFrom = new Date(obj.ticketsAvailableFrom);

        if (endedAt <= startedAt) {
            return 'The end date must be after the start date';
        }

        if (endedAt.getTime() - startedAt.getTime() < EVENT_TIME_CONSTANTS.MIN_DURATION_MS) {
            return `The minimum duration of the event should be ${EVENT_CONSTANTS.MIN_DURATION_MINUTES} minutes`;
        }
        
        if (startedAt.getTime() - publishedAt.getTime() < EVENT_TIME_CONSTANTS.MIN_PUBLISH_BEFORE_START_MS) {
            return `The event must be published at least ${EVENT_CONSTANTS.MIN_PUBLISH_BEFORE_START_HOURS} hours before the start`;
        }
        if (ticketsAvailableFrom >= startedAt) {
            return `The ticket sales must end before the event starts`;
        }
        if (ticketsAvailableFrom < publishedAt) {
            return `The ticket sales cannot start before the event is published`;
        }

        return 'Invalid event dates';
    }
}

export function ValidateEventDates(validationOptions?: ValidationOptions) {
    return function (target: any) {
        const originalValidate = target.prototype.validate;
        target.prototype.validate = function() {
            const validator = new EventDatesValidatorConstraint();
            if (!validator.validate(this, {} as ValidationArguments)) {
                return false;
            }
            return originalValidate ? originalValidate.apply(this) : true;
        };
    };
}