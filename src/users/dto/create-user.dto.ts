import { IsUserEmail, IsUserName, IsUserPassword } from '../users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsUserName(false)
    @ApiProperty({
        required: true,
        description: 'First name',
        nullable: false,
        type: 'string',
        example: 'Ann',
    })
    firstName: string;

    @IsUserName(true)
    @ApiProperty({
        required: false,
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName?: string;

    @IsUserEmail(false)
    @ApiProperty({
        required: true,
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @IsUserPassword(false)
    @ApiProperty({
        required: true,
        description: 'Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    password: string;
}
