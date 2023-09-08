import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { PredictionModule } from './prediction/prediction.module';
import { MongoPrismaService } from './prisma/mongo-prisma.service';
import { PostgresPrismaService } from './prisma/postgres-prisma.service';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    PredictionModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      exclude: ['/api*'],
    }),
  ],
  providers: [PostgresPrismaService, MongoPrismaService],
})
export class AppModule {}
