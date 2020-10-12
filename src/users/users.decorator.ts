import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserToken = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  if (!!req.token) {
    return !!data ? req.token[data] : req.token;
  }
});