import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { generateFileName, multerOptionsMemoryStorage } from 'src/shared/utils/image.utils';
import { PredictionService } from './prediction.service';
import { firstValueFrom } from 'rxjs';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post('predict-face')
  @UseInterceptors(FileInterceptor('file', multerOptionsMemoryStorage))
  @UseGuards(JwtGuard)
  async predictFace(
    @CurrentUser('id') userId: number,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    file.filename = generateFileName(file, userId.toString());
    const prediction = await firstValueFrom(this.predictionService.predictFace(file, userId));
    return prediction;
  }

  @Get('image/:id')
  @UseGuards(JwtGuard)
  public async getPredictionImage(@CurrentUser('id') userId: number, @Param('id') imageId: number) {
    return await this.predictionService.getPredictionImage(userId, imageId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  public async delete(@Param('id') predictionId: number, @CurrentUser('id') userId: number) {
    return await this.predictionService.deletePrediction(userId, predictionId);
  }
}
