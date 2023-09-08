import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoPrismaClient } from '@final-project/database';

@Injectable()
export class MongoPrismaService
  extends MongoPrismaClient.PrismaClient
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}
