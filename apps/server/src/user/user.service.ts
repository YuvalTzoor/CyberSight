import { PostgresPrismaClient } from '@final-project/database';
import { UserPayload } from '@final-project/shared';
import { HttpException, HttpStatus, Injectable, Logger, StreamableFile } from '@nestjs/common';
import * as argon from 'argon2';
import { UserUpdateDto } from './dto/user-update.dto';
import { PostgresPrismaService } from 'src/prisma/postgres-prisma.service';
import { MongoPrismaClient } from '@final-project/database';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';
import * as fs from 'fs';
const { Action } = MongoPrismaClient;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private postgresPrismaService: PostgresPrismaService,
    private readonly mongoPrismaService: MongoPrismaService,
  ) {}

  async findUserById(id: number): Promise<UserPayload> {
    const user = await this.postgresPrismaService.user.findUnique({
      where: {
        id,
      },
    });
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImagePath: user.profileImagePath,
    };
  }
  async findUserByEmail(email: string): Promise<UserPayload> {
    const user = await this.postgresPrismaService.user.findUnique({
      where: {
        email,
      },
    });
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImagePath: user.profileImagePath,
    };
  }

  async update(id: number, userUpdateDto: UserUpdateDto, userAgent: string, ip: string): Promise<UserPayload> {
    const updatedValues: {
      property: string;
      oldValue?: string;
      newValue?: string;
    }[] = [];
    const currentUser = await this.postgresPrismaService.user.findUnique({
      where: { id: id },
    });
    if (userUpdateDto.password && userUpdateDto.newPassword) {
      updatedValues.push({ property: 'password' });

      const passwordsMatch = await argon.verify(currentUser.password, userUpdateDto.password);
      if (!passwordsMatch) {
        throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
      }

      currentUser.password = await argon.hash(userUpdateDto.newPassword);
    }
    if (userUpdateDto.firstName && currentUser.firstName !== userUpdateDto.firstName) {
      updatedValues.push({
        property: 'firstName',
        oldValue: currentUser.firstName,
        newValue: userUpdateDto.firstName,
      });
      currentUser.firstName = userUpdateDto.firstName;
    }
    if (userUpdateDto.lastName && currentUser.lastName !== userUpdateDto.lastName) {
      updatedValues.push({
        property: 'lastName',
        oldValue: currentUser.lastName,
        newValue: userUpdateDto.lastName,
      });
      currentUser.lastName = userUpdateDto.lastName;
    }
    const updatedValueStrings = updatedValues.map((x) => JSON.stringify(x));
    const updatedUser = await this.postgresPrismaService.user.update({
      where: { id: currentUser.id },
      data: {
        ...currentUser,
      },
    });
    await this.mongoPrismaService.log.create({
      data: {
        action: Action.Update,
        userAgent,
        ip,
        notes: updatedValueStrings,
        userId: currentUser.id,
      },
    });
    this.logger.log(`User ${currentUser.id} updated`);

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImagePath: updatedUser.profileImagePath,
    };
  }

  async updateProfileImagePath({
    id,
    profileImagePath,
  }: PostgresPrismaClient.Prisma.UserGetPayload<{
    select: {
      id: true;
      profileImagePath: true;
    };
  }>): Promise<UserPayload> {
    const currentUser = await this.postgresPrismaService.user.update({
      where: {
        id,
      },
      data: {
        profileImagePath,
      },
    });

    return {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      role: currentUser.role,
      profileImagePath: currentUser.profileImagePath,
    };
  }
  async getCurrentUser(id: number): Promise<UserPayload> {
    const currentUser = await this.postgresPrismaService.user.findUnique({
      where: { id },
    });
    return {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      role: currentUser.role,
      profileImagePath: currentUser.profileImagePath,
    };
  }

  async delete(id: number, password: string, userAgent: string, ip: string): Promise<UserPayload> {
    const user = await this.postgresPrismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else {
      const passwordsMatch = await argon.verify(user.password, password);

      if (!passwordsMatch) {
        throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
      }
    }

    const deletedUser = await this.postgresPrismaService.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImagePath: true,
      },
    });
    await this.mongoPrismaService.log.create({
      data: {
        action: Action.Delete,
        userAgent,
        ip,
        userId: deletedUser.id,
      },
    });
    this.logger.log(`User ${deletedUser.id} deleted`);
    return deletedUser;
  }
  async getProfileImage(user: UserPayload) {
    const imagePath = user.profileImagePath;
    const fileExists = await fs.promises.stat(imagePath).catch(() => false);
    if (!fileExists) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    } else {
      const file = fs.createReadStream(imagePath).on('error', (error) => {
        this.logger.error(`Error reading file. User: ${user.email}. image path: ${imagePath}. Error: ${error}`);
      });
      return new StreamableFile(file);
    }
  }
}
