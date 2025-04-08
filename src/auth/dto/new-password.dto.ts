// src/auth/dto/new-password.dto.ts
import { IsUserPassword } from '../../users/users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordDto {
    @IsUserPassword(false)
    @ApiProperty({
        description: 'New password',
        nullable: false,
        type: 'string',
        example: 'NewPassword123!$',
    })
    newPassword: string;
}
