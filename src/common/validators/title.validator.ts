import { applyDecorators } from '@nestjs/common';
import { IsOptional, Length, Matches, ValidateIf } from 'class-validator';

export function IsTitle(
    isOptional: boolean,
    allowNull: boolean = false,
    minLength: number = 1,
    maxLength: number = 100,
) {
    const baseDecorators = [
        Matches(/^[\x20-\x7E]+$/u),
        Length(minLength, maxLength),
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
