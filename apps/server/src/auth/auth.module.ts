import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfig, SecurityConfig } from 'src/config/config.interface';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { TokenService } from './token.service';
import { JwtGuard } from './guard/jwt.guard';
import JwtRefreshGuard from './guard/jwt-refresh.guard';

@Module({
  providers: [AuthService, TokenService, JwtStrategy, JwtRefreshTokenStrategy, JwtGuard, JwtRefreshGuard],
  exports: [AuthService, TokenService],
  imports: [
    PassportModule.register({
      defaultStrategy: ['jwt'],
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvConfig>) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: securityConfig.jwt_access_secret,
          signOptions: {
            expiresIn: securityConfig.jwt_access_expiration,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
