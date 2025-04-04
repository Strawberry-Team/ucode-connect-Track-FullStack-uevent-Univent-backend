// src/auth/dto/new-password.dto.ts
import {IsUserPassword} from "../../user/users.validator";

export class newPasswordDto {
    @IsUserPassword(false)
    newPassword: string;
}
