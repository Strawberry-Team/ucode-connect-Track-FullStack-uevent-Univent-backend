// src/models/events/validators/events.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsOptional, ValidateIf } from 'class-validator';
import { IsName } from '../../../common/validators/name.validator';

export function IsCoordinates(isOptional: boolean, allowNull: boolean = false) {
    const baseDecorators = [
        IsName(isOptional, allowNull, 10, 100),
        // TODO add regex for coordinates
    ];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...baseDecorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
        return applyDecorators(...baseDecorators);
    }
}

