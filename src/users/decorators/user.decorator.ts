// src/users/decorators/users.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadType } from '../../common/types/request.types';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        // Return null if the user is not authenticated
        // TODO: Треба зробити по нормальному.
        // Зараз через особливості BaseCrudController є проблеми з публічними маршрутами.
        if (!request.user) {
            return null;
        }

        const userId: UserPayloadType = request.user.userId;

        return userId;
    },
);
