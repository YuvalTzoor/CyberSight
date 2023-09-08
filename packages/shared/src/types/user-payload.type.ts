import { PostgresPrismaClient } from '@final-project/database';

const userPayload = PostgresPrismaClient.Prisma.validator<PostgresPrismaClient.Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    role: true,
    firstName: true,
    lastName: true,
    profileImagePath: true,
  },
});
export type UserPayload = PostgresPrismaClient.Prisma.UserGetPayload<typeof userPayload>;

const tokenPayload = PostgresPrismaClient.Prisma.validator<PostgresPrismaClient.Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    role: true,
  },
});
export type TokenPayload = PostgresPrismaClient.Prisma.UserGetPayload<typeof tokenPayload>;
