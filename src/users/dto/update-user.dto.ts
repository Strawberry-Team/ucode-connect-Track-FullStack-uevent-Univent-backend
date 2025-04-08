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
        required: false,
        description: 'First name',
        nullable: true,
        type: 'string',
        example: 'Ann',
    })
    firstName?: string;

    @IsUserName(true)
    @ApiProperty({
        required: false,
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName?: string;

    @IsUserEmail(true)
    @ApiProperty({
        required: false,
        description: 'User email',
        nullable: true,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email?: string;

    @IsUserPassword(true)
    @ApiProperty({
        required: false,
        description: 'Old password',
        nullable: true,
        type: 'string',
        example: 'Password123!$',
    })
    oldPassword?: string;

    @IsUserPassword(true)
    @ApiProperty({
        required: false,
        description: 'New password',
        nullable: true,
        type: 'string',
        example: 'NewPassword123!$',
    })
    newPassword?: string;

    @IsUserProfilePicture(true)
    @ApiProperty({
        required: false,
        description: 'Profile picture',
        nullable: true,
        type: 'string',
        example: 'ann-nichols-avatar.png',
    })
    profilePictureName?: string;

    @ValidatePasswordUpdate()
    __dummyField?: never;
}
