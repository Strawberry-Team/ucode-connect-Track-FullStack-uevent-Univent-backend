// src/users/dto/create-users.dto.ts
import { IsUserEmail, IsUserName, IsUserPassword } from '../users.validator';

export class CreateUserDto {
    @IsUserName(false)
    firstName: string;

    @IsUserName(true)
    lastName?: string;

    @IsUserEmail(false)
    email: string;

    @IsUserPassword(false)
    password: string;
}
