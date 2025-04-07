import { IsEmail } from '../../common/validators/email.validator';
import { IsTitle } from '../../common/validators/title.validator';
import { IsDescription } from '../../common/validators/description.validator';
import { IsId } from '../../common/validators/id.validator';

export class CreateCompanyDto {
    @IsId(false)
    ownerId: number;

    @IsEmail(false)
    email: string;

    @IsTitle(false)
    title: string;

    @IsDescription(true)
    description?: string;
}
