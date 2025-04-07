// src/tickets/tickets.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import { TicketStatus } from '@prisma/client';
import {
    IsString,
    IsNumber,
    IsPositive,
    IsOptional,
    MinLength,
    MaxLength,
    IsEnum,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export function IsTicketStatusValid(validationOptions?: ValidationOptions) {
    //TODO: Check if validator аlready exists
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isTicketStatusValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return Object.values(TicketStatus).includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be one of the following values: ${Object.values(
                        TicketStatus,
                    ).join(', ')}`;
                },
            },
        });
    };
}

/**
 * Decorator for eventId.
 */
export function IsTicketEventId(): PropertyDecorator {
    return applyDecorators(
        IsNumber(),
        IsPositive(),
        ApiProperty({
            description: 'Event ID associated with the ticket',
            example: 1,
        }),
    );
}

/**
 * Decorator for ticket title.
 * @param isOptional Set to true when the field is optional.
 */
export function IsTicketTitle(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsString(),
        MinLength(3),
        MaxLength(100),
        ApiProperty({
            description: 'Ticket title',
            example: 'VIP Ticket',
            maxLength: 100,
            required: !isOptional,
        }),
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

/**
 * Decorator for unique ticket number.
 * @param isOptional Set to true when the field is optional.
 */
export function IsTicketNumber(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsString(),
        MinLength(5),
        MaxLength(255),
        ApiProperty({
            description: 'Unique ticket number',
            example: 'TICKET-123-456',
            maxLength: 255,
            required: !isOptional,
        }),
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

/**
 * Decorator for ticket price.
 * @param isOptional Set to true when the field is optional.
 */
export function IsTicketPrice(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsNumber(),
        IsPositive(),
        Type(() => Number),
        ApiProperty({
            description: 'Ticket price',
            example: 99.99,
            required: !isOptional,
        }),
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

/**
 * Decorator for ticket status.
 * @param isOptional Set to true when the field is optional.
 */
export function IsTicketStatus(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsEnum(TicketStatus),
        IsTicketStatusValid(),
        ApiProperty({
            description: 'Ticket status',
            enum: TicketStatus,
            default: TicketStatus.AVAILABLE,
            required: !isOptional,
        }),
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}
