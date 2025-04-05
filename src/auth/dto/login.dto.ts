// src/auth/dto/login.dto.ts
import { IsUserEmail, IsUserPassword } from '../../users/users.validator';

export class LoginDto {
    @IsUserEmail(false)
    email: string;

    @IsUserPassword(false)
    password: string;
}
