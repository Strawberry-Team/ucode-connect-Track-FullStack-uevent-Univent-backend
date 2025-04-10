// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadType } from '../types/request.types';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        // Return null if the user is not authenticated
        // TODO: We need to do it properly.
        // Now, due to the peculiarities of BaseCrudController, there are problems with public routes.
        if (!request.user) {
            return null;
        }

        const userId: UserPayloadType = request.user.userId;

        return userId;
    },
);
