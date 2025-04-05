// src/users/decorators/users.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadType } from '../../common/types/request.types';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const userId: UserPayloadType = request.user.userId;

        return userId;
    },
);
