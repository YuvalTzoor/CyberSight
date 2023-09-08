import { UserPayload } from '@final-project/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { PredictionService } from 'src/prediction/prediction.service';
import { multerOptionsProfileImage } from 'src/shared/utils/image.utils';
import { UserDeleteDto } from './dto/user-delete.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly predictionService: PredictionService,
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  public async getCurrentUser(@CurrentUser('id') userId: number): Promise<UserPayload> {
    const user = await this.userService.getCurrentUser(userId);
    return user;
  }

  @Put()
  @UseGuards(JwtGuard)
  public async update(
    @CurrentUser('id') userId: number,
    @Body() userUpdateDto: UserUpdateDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<UserPayload> {
    const updatedUser = await this.userService.update(userId, userUpdateDto, userAgent, ip);
    return updatedUser;
  }

  @Get('profile-image')
  @UseGuards(JwtGuard)
  async getProfileImage(@CurrentUser() user: UserPayload) {
    const fileStream = await this.userService.getProfileImage(user);
    return fileStream;
  }
  @Put('profile-image')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file', multerOptionsProfileImage))
  public async updateProfileImage(
    @CurrentUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserPayload> {
    const user = await this.userService.updateProfileImagePath({
      id: userId,
      profileImagePath: file.path,
    });
    return user;
  }

  @Delete()
  @UseGuards(JwtGuard)
  public async delete(
    @CurrentUser('id') id: number,
    @Body() userDeleteDto: UserDeleteDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ): Promise<UserPayload> {
    const deletedUser = await this.userService.delete(id, userDeleteDto.password, userAgent, ip);
    return deletedUser;
  }

  @Get('predictions')
  @UseGuards(JwtGuard)
  public async getPredictions(@CurrentUser('id') userId: number) {
    const predictions = await this.predictionService.getPredictionsByUserId(userId);
    return predictions;
  }
}
