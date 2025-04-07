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
        const userId = request.user?.id;
        const companyId: number = +request.params?.id;

        const company = await this.companyService.findCompanyById(companyId);

        if (!company) {
            throw new ForbiddenException(
                'Company not found or you do not have access',
            );
        }

        if (company.ownerId !== userId) {
            throw new ForbiddenException(
                'You can only access your own company',
            );
        }

        return true;
    }
}
