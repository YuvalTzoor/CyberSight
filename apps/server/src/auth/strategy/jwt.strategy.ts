import { PostgresPrismaClient } from '@final-project/database';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfig, SecurityConfig } from 'src/config/config.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<EnvConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<SecurityConfig>('security').jwt_access_secret,
      ignoreExpiration: false,
    });
  }

  async validate(
    userPayload: PostgresPrismaClient.Prisma.UserGetPayload<{
      select: { id: true };
    }>,
  ) {
    const user = await this.authService.validateUser(userPayload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
