// src/common/validators/date.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    IsISO8601,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function IsLaterThan(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isLaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const relatedValue = (args.object as any)['startedAt'];
                    return new Date(value) >= new Date(relatedValue);
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be later than ${relatedPropertyName}`;
                },
            },
        });
    };
}

export function IsISO8601Date(isOptional: boolean, allowNull: boolean = false) {
    const decorators = [
        IsISO8601({ 
            strict: true,
            // strictSeparator: true
        })
    ];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...decorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

/**
 * Validator that checks if the difference between two dates is greater than the specified value in minutes.
 * @param property - The name of the property to compare with
 * @param minDifferenceMinutes - The minimum difference in minutes
 * @param validationOptions - Validation options
 */
export function IsTimeDifferenceGreaterThan(
    property: string,
    minDifferenceMinutes: number,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isTimeDifferenceGreaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property, minDifferenceMinutes],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName, minDiffMinutes] = args.constraints;
                    // console.log('relatedPropertyName', relatedPropertyName);
                    // console.log('minDiffMinutes', minDiffMinutes);
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    
                    if (!value || !relatedValue) {
                        return true; // Skip validation if one of the values is missing
                    }
                    
                    const date1 = new Date(value);
                    const date2 = new Date(relatedValue);
                    
                    // Calculate the difference in milliseconds
                    const differenceMs = Math.abs(date1.getTime() - date2.getTime());
                    
                    // Convert milliseconds to minutes
                    const differenceMinutes = differenceMs / (60 * 1000);
                    // console.log('differenceMinutes', differenceMinutes);

                    return differenceMinutes >= minDiffMinutes;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName, minDiffMinutes] = args.constraints;
                    return `${args.property} must be at least ${minDiffMinutes} minutes different from ${relatedPropertyName}`;
                },
            },
        });
    };
}
