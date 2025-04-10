// src/models/users/dto/update-user-password.dto.ts
import {
    IsPassword,
} from '../validators/users.validator';

export class UpdateUserPasswordDto {
    @IsPassword(false)
    oldPassword: string;

    @IsPassword(false)
    newPassword: string;
}
