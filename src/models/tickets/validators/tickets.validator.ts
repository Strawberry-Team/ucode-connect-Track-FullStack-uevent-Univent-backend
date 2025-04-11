// src/models/tickets/validators/tickets.validator.ts
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

export function IsTicketPrice(isOptional: boolean): PropertyDecorator {
    const decorators = [IsNumber(), IsPositive()];//TODO: Type(() => Number) ???

    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}

export function IsTicketStatus(isOptional: boolean): PropertyDecorator {
    const decorators = [
        IsEnumValue(TicketStatus, isOptional),
    ];
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        ...decorators,
    );
}
