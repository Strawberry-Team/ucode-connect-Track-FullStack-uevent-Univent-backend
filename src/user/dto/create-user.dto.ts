// src/user/dto/create-user.dto.ts
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

    // @IsValidCountryCode({ message: 'Invalid country code, must be cca2' }, true)
    // countryCode: string; TODO: deldel
}
