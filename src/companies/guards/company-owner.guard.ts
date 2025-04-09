import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { CompaniesService } from '../companies.service';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
    constructor(private readonly companyService: CompaniesService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const companyId: number = +request.params?.id;

        const company = await this.companyService.findCompanyById(companyId);

        if (!company) {
            throw new ForbiddenException(
                'Company not found or access denied',
            );
        }

        if (company.ownerId !== userId) {
            console.log(company.ownerId);
            console.log(userId);
            throw new ForbiddenException(
                'Only the company owner has access to it',
            );
        }

        return true;
    }
}
