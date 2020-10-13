import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserToken = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!!request.token) {
    return !!data ? request.token[data] : request.token;
  }
});