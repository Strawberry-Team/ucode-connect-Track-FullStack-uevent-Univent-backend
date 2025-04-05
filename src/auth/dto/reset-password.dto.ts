// src/auth/dto/reset-password.dto.ts
import { IsUserEmail } from '../../users/users.validator';

export class ResetPasswordDto {
    @IsUserEmail(false)
    email: string;
}
