import { MongoPrismaClient, PostgresPrismaClient } from '@final-project/database';
import { TokenPayload, UserPayload, UserWithTokensDataPayload } from '@final-project/shared';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';
import { PostgresPrismaService } from 'src/prisma/postgres-prisma.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { TokenService } from './token.service';
const { Action } = MongoPrismaClient;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly postgresPrismaService: PostgresPrismaService,
    private readonly mongoPrismaService: MongoPrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(
    userPayload: PostgresPrismaClient.Prisma.UserGetPayload<{
      select: { id: true };
    }>,
  ): Promise<PostgresPrismaClient.User> {
    const user = await this.postgresPrismaService.user.findUnique({
      where: {
        id: userPayload.id,
      },
    });

    return user;
  }

  async createUser(userRegisterDto: UserRegisterDto, userAgent: string, ip: string): Promise<UserPayload> {
    const hashedPassword = await argon.hash(userRegisterDto.password);
    try {
      const { id, email, firstName, lastName, role, profileImagePath } = await this.postgresPrismaService.user.create({
        data: {
          ...userRegisterDto,
          password: hashedPassword,
          role: PostgresPrismaClient.Role.USER,
        },
      });
      await this.mongoPrismaService.log.create({
        data: {
          action: Action.Register,
          userAgent,
          ip,
          userId: id,
        },
      });
      this.logger.log(`User ${id} registered`);
      return { id, email, firstName, lastName, role, profileImagePath };
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`Email ${userRegisterDto.email} already used.`);
      }
      throw new Error(typeof error === 'string' ? error : 'error');
    }
  }

  async login(userLoginDto: UserLoginDto, userAgent: string, ip: string): Promise<UserWithTokensDataPayload> {
    const user = await this.postgresPrismaService.user.findUnique({
      where: { email: userLoginDto.email },
      include: {
        tokens: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Bad credentials');
    }

    const passwordsMatch = await argon.verify(user.password, userLoginDto.password);
    if (!passwordsMatch) {
      throw new BadRequestException('Bad credentials');
    }

    const { accessToken, refreshToken, tokenId } = await this.tokenService.handleTokensWhenUserLogin(user);

    const userAndTokensData: UserWithTokensDataPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImagePath: user.profileImagePath,
      tokensData: {
        accessToken,
        refreshToken,
        tokenId,
      },
    };

    await this.mongoPrismaService.log.create({
      data: {
        action: Action.Login,
        userAgent,
        ip,
        userId: user.id,
      },
    });
    this.logger.log(`User ${user.id} logged in`);
    return userAndTokensData;
  }

  async logout(userId: number, refreshTokenId: string, userAgent?: string, ip?: string) {
    await this.tokenService.deleteUserRefreshToken(userId, refreshTokenId);

    if (userAgent && ip) {
      await this.mongoPrismaService.log.create({
        data: {
          action: Action.Logout,
          ip,
          userAgent,
          userId,
        },
      });
      this.logger.log(`User ${userId} logged out`);
    }
  }

  async getUserIfRefreshTokenMatches(tokenId: string, refreshToken: string, payload: TokenPayload) {
    const token = await this.tokenService.findRefreshTokenById(tokenId);

    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }

    const isMatch = await argon.verify(token.refreshToken, refreshToken);
    const secondsUntilTokenExpires = await this.tokenService.getSecondsUntilTokenExpires(token);

    if (secondsUntilTokenExpires < 0) {
      await this.logout(payload.id, tokenId);
      throw new BadRequestException('Refresh token expired');
    } else if (isMatch) {
      return await this.tokenService.generateAndUpdateTokens(payload, tokenId);
    } else {
      if (payload.id !== token.userId) {
        await this.tokenService.deleteAllUserRefreshTokens(token.userId);
        this.logger.warn(
          `Request was made with an invalid refresh token. Deleting all refresh tokens for user ${token.userId}`,
        );
        throw new UnauthorizedException();
      }
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }
}
