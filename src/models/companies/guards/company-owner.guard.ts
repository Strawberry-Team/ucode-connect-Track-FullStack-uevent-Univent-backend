// src/models/companies/guards/company-owner.guard.ts
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
        const companyId: number =
            +request.params?.id || +request.params?.companyId;

        const company = await this.companyService.findById(companyId);

        if (!company) {
            throw new ForbiddenException('Company not found or access denied');
        }

        if (company.ownerId !== userId) {
            throw new ForbiddenException(
                'Only the company owner has access to it',
            );
        }

        return true;
    }
}
