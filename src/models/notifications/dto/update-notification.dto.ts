import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateNotificationDto {
    @ApiProperty({
        description: 'Action to perform on notification',
        example: 'read',
        enum: ['read', 'hide'],
        required: true
    })
    @IsNotEmpty()
    @IsEnum(['read', 'hide'])
    action: 'read' | 'hide';
}