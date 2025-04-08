// src/users/dto/update-users.dto.ts
import {
    IsUserEmail,
    IsUserName,
    IsUserPassword,
    IsUserProfilePicture,
    ValidatePasswordUpdate,
} from '../users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @IsUserName(true)
    @ApiProperty({
        description: 'First name',
        nullable: true,
        type: 'string',
        example: 'Rayna',
    })
    firstName?: string;

    @IsUserName(true)
    @ApiProperty({
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Gariette',
    })
    lastName?: string;

    @IsUserEmail(true)
    @ApiProperty({
        description: 'User email',
        nullable: true,
        type: 'string',
        example: 'rayna.gariette@gmail.com',
    })
    email?: string;

    @IsUserPassword(true)
    @ApiProperty({
        description: 'Old password',
        nullable: true,
        type: 'string',
        example: 'Password123!$',
    })
    oldPassword?: string;

    @IsUserPassword(true)
    @ApiProperty({
        description: 'New password',
        nullable: true,
        type: 'string',
        example: 'NewPassword123!$',
    })
    newPassword?: string;

    @IsUserProfilePicture(true)
    @ApiProperty({
        description: 'Profile picture',
        nullable: true,
        type: 'string',
        example: 'rayna-avatar.png',
    })
    profilePictureName?: string;

    @ValidatePasswordUpdate()
    __dummyField?: never;
}
