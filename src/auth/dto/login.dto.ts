// src/auth/dto/login.dto.ts
import { IsUserEmail, IsUserPassword } from '../../users/users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
