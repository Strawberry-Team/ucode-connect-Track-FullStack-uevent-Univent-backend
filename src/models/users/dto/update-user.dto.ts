// src/models/users/dto/update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password', 'email'] as const)
) {}
