import { PostgresPrismaClient } from '@final-project/database';

const predictionPayload = PostgresPrismaClient.Prisma.validator<PostgresPrismaClient.Prisma.PredictionDefaultArgs>()({
  select: {
    id: true,
    logreg: true,
    neural_net: true,
    svclassifier: true,
    imageId: true,
    createdAt: true,
  },
});
export type PredictionPayload = PostgresPrismaClient.Prisma.PredictionGetPayload<typeof predictionPayload>;
