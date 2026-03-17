import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Authorized = createParamDecorator(
  (_data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; 
  },
);