import { IsNotEmpty, IsString } from "class-validator";

export class CreateFormatDto {
    @IsString()
    @IsNotEmpty()
    title: string;
}
