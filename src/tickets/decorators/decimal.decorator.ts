// src/common/decorators/decimal.decorator.ts
import { Transform } from 'class-transformer';
import { Prisma } from '@prisma/client';

export const ToDecimal = () =>
  Transform(({ value }) => (value !== undefined ? new Prisma.Decimal(value.toString()) : undefined));

export const FromDecimal = () =>
  Transform(({ value }) => (value !== undefined ? value.toNumber() : undefined));