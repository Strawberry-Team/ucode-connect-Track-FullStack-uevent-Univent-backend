// src/users/dto/create-users.dto.ts
import { IsUserEmail, IsUserName, IsUserPassword } from '../users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsUserName(false)
    @ApiProperty({
        description: 'First name',
        nullable: false,
        type: 'string',
        example: 'Ann',
    })
    firstName: string;

    @IsUserName(true)
    @ApiProperty({
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName?: string;

    @IsUserEmail(false)
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @IsUserPassword(false)
    @ApiProperty({
        description: 'Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    password: string;
}
