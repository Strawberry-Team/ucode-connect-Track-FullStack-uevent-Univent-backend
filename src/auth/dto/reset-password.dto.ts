// src/auth/dto/reset-password.dto.ts
import { IsUserEmail } from '../../users/users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @IsUserEmail(false)
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;
}
