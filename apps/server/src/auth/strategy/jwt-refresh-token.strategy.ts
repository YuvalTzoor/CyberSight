import { TokenPayload } from '@final-project/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { EnvConfig, SecurityConfig } from 'src/config/config.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    configService: ConfigService<EnvConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<SecurityConfig>('security').jwt_refresh_secret,
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(
    request: Request,
    payload: TokenPayload,
  ): Promise<
    | {
        accessToken: string;
        refreshToken: string;
        tokenId: string;
        user: TokenPayload;
      }
    | false
  > {
    const refreshToken = request.header('Authorization').split(' ')[1];

    const tokenId = request.header('Token-Id');

    if (tokenId === undefined) {
      return false;
    }
    return await this.authService.getUserIfRefreshTokenMatches(tokenId, refreshToken, payload);
  }
}
