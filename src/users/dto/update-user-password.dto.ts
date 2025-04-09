// src/users/dto/update-user-password.dto.ts
import {
    IsUserPassword,
} from '../users.validator';

export class UpdateUserPasswordDto {
    @IsUserPassword(false)
    oldPassword: string;

    @IsUserPassword(false)
    newPassword: string;
}
