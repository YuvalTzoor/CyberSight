import { UserPayload, UserWithTokensDataPayload } from '@final-project/shared';
import { Body, Controller, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser, CurrentUserWithTokenId } from '../user/decorator/current-user.decorator';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import JwtRefreshGuard from './guard/jwt-refresh.guard';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() userRegisterDto: UserRegisterDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<UserPayload> {
    const user = await this.authService.createUser(userRegisterDto, userAgent, ip);
    return user;
  }

  @Post('login')
  public async login(
    @Body() userLoginDto: UserLoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<UserWithTokensDataPayload> {
    const user = await this.authService.login(userLoginDto, userAgent, ip);
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  public refreshToken(@CurrentUser() user: UserPayload): UserPayload {
    return user;
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  public async logout(
    @CurrentUserWithTokenId() user: UserPayload & { tokenId: string },
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    const loggedOutUser = await this.authService.logout(user.id, user.tokenId, userAgent, ip);
    return loggedOutUser;
  }
}
