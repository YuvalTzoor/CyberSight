import { Injectable } from '@nestjs/common';
import type { IAuthGuard } from '@nestjs/passport';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export default class JwtRefreshGuard
  extends AuthGuard('jwt-refresh-token')
  implements IAuthGuard
{
  constructor() {
    super();
  }
}
