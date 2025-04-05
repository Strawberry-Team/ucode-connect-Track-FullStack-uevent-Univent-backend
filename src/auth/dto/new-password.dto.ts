// src/auth/dto/new-password.dto.ts
import { IsUserPassword } from '../../users/users.validator';

export class newPasswordDto {
    @IsUserPassword(false)
    newPassword: string;
}
