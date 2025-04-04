// src/user/dto/update-user.dto.ts
import {
    IsUserEmail,
    IsUserName, IsUserPassword, IsUserProfilePicture, ValidatePasswordUpdate,
} from '../users.validator';

export class UpdateUserDto {
    @IsUserName(true)
    firstName?: string;

    @IsUserName(true)
    lastName?: string;

    @IsUserEmail(true)
    email?: string;

    @IsUserPassword(true)
    oldPassword?: string;

    @IsUserPassword(true)
    newPassword?: string;

    @IsUserProfilePicture(true)
    profilePictureName?: string;

    @ValidatePasswordUpdate()
    __dummyField?: never;
}
