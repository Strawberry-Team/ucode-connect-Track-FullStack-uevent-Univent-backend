import { AuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt-access') {
    constructor(
        private readonly usersService: UsersService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const result = await super.canActivate(context);
            if (!result) return true;

            const request = context.switchToHttp().getRequest();
            const { user } = request;

            if (!user || !user.userId) {
                return true;
            }

            const userExists = await this.usersService.findUserByIdWithoutPassword(
                user.userId,
            );
            if (!userExists) {
                return true;
            }

            return true;
        } catch (error) {
            return true;
        }
    }
}
