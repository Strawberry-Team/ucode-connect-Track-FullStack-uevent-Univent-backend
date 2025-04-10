// src/models/tickets/validators/tickets.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import { TicketStatus } from '@prisma/client';
import {
    IsNumber,
    IsPositive,
    IsOptional,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsName } from '../../../common/validators/name.validator';
import { IsEnumValue } from 'src/common/validators/enum.validator';

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

export function IsTicketNumber(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsName(isOptional, false, 5, 255),
        //TODO: add regex
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

export function IsTicketPrice(isOptional: boolean): PropertyDecorator {
    const decorators = [IsNumber(), IsPositive(), Type(() => Number)]; // TODO do we need here @Type?
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

export function IsTicketStatus(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsEnumValue(IsTicketStatus, isOptional),
        IsTicketStatusValid(), //TODO: точно ли нужен этот валидатор, если есть @IsEnum?
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}
