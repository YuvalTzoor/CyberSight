import { PostgresPrismaClient } from '@final-project/database';
import { TokenPayload } from '@final-project/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { EnvConfig, SecurityConfig } from 'src/config/config.interface';
import { PostgresPrismaService } from 'src/prisma/postgres-prisma.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly postgresPrismaService: PostgresPrismaService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async handleTokensWhenUserLogin({
    id,
    email,
    role,
    tokens,
  }: PostgresPrismaClient.Prisma.UserGetPayload<{
    include: {
      tokens: true;
    };
  }>) {
    {
      const { accessToken, refreshToken } = await this.generateTokens({
        id,
        email,
        role,
      });
      const { id: tokenId } = await this.saveRefreshTokenInDb(id, refreshToken);
      await this.deleteOldRefreshTokensInDb(id, tokens);

      return { tokenId, refreshToken, accessToken };
    }
  }
  private async generateTokens({ id, email, role }: TokenPayload, expiresIn?: number) {
    const payload: TokenPayload = { id, email, role };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload, expiresIn);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(payload: TokenPayload) {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: securityConfig.jwt_access_expiration,
      secret: securityConfig.jwt_access_secret,
    });
    return accessToken;
  }
  private async generateRefreshToken(payload: TokenPayload, expiresIn?: number) {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn ?? securityConfig.jwt_refresh_expiration,
      secret: securityConfig.jwt_refresh_secret,
    });
    return refreshToken;
  }

  private async saveRefreshTokenInDb(userId: number, refreshToken: string) {
    const expiresIn = this.jwtService.decode(refreshToken)['exp'];

    try {
      const hash = await argon.hash(refreshToken);
      const token = await this.postgresPrismaService.token.create({
        data: {
          expiresAt: new Date(expiresIn * 1000),
          refreshToken: hash,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return token;
    } catch (error) {
      this.logger.error(`Error saving refresh token for user ${userId}: ${error}`);
    }
  }

  private async deleteOldRefreshTokensInDb(userId: number, tokens: PostgresPrismaClient.Token[], quantity: number = 5) {
    if (tokens.length > quantity) {
      try {
        const date = new Date();
        await this.postgresPrismaService.token.deleteMany({
          where: {
            AND: [
              {
                userId: userId,
              },
              {
                OR: [
                  {
                    id: {
                      in: tokens.slice(0, tokens.length - quantity).map((t) => t.id),
                    },
                  },
                  {
                    expiresAt: {
                      lt: date,
                    },
                  },
                ],
              },
            ],
          },
        });
      } catch (error) {
        this.logger.error(`Error deleting old refresh tokens for user ${userId}: ${error}`);
      }
    }
  }
  async findRefreshTokenById(id: string) {
    const token = await this.postgresPrismaService.token.findUnique({
      where: {
        id,
      },
    });
    return token;
  }
  async deleteUserRefreshToken(userId: number, tokenId: string) {
    try {
      await this.postgresPrismaService.token.delete({
        where: {
          id: tokenId,
          user: {
            id: userId,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting refresh token for user ${userId}: ${error}`);
    }
  }

  async deleteAllUserRefreshTokens(userId: number) {
    try {
      return await this.postgresPrismaService.token.deleteMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting all refresh tokens for user ${userId}: ${error}`);
    }
  }
  async getSecondsUntilTokenExpires(token: PostgresPrismaClient.Token) {
    const secondsUntilExpire = this.differenceInSeconds(new Date(token.expiresAt), new Date());
    return secondsUntilExpire;
  }

  async generateAndUpdateTokens(payload: TokenPayload, refreshTokenId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const hash = await argon.hash(refreshToken);

    await this.postgresPrismaService.token.update({
      where: {
        id: refreshTokenId,
      },
      data: {
        refreshToken: hash,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenId: refreshTokenId,
      user: payload,
    };
  }
  private differenceInSeconds(startDate: Date, endDate: Date) {
    const diffInMs = startDate.getTime() - endDate.getTime();
    return diffInMs / 1000;
  }
}
