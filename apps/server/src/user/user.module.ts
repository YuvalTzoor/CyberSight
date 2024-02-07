import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PredictionService } from 'src/prediction/prediction.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule],
  providers: [UserService, PredictionService],
  exports: [UserService],
  controllers: [UserController],
})


export class UserModule {}
