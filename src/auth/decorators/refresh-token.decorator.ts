import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {RefreshTokenPayloadType} from '../../common/types/request.types'

export const RefreshTokenPayload = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const { userId, ...payload } = request.user;
        
        const refreshTokenPayload: RefreshTokenPayloadType = payload;

        return data ? refreshTokenPayload?.[data] : refreshTokenPayload;
    },
);