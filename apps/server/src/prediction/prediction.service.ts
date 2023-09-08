import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import { isAxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { catchError, map } from 'rxjs';
import { PostgresPrismaService } from 'src/prisma/postgres-prisma.service';
import { EnvConfig } from 'src/config/config.interface';
import { PredictionPayload } from '@final-project/shared';
import { createReadStream } from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class PredictionService {
  private baseFlaskUrl: string;
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    private readonly httpService: HttpService,
    private postgresPrismaService: PostgresPrismaService,
    private configService: ConfigService<EnvConfig>,
  ) {
    this.baseFlaskUrl = configService.get<string>('flask_url');
  }
  predictFace(file: Express.Multer.File, userId: number) {
    const url = `${this.baseFlaskUrl}/check_face`;
    const data = new FormData();
    data.append('file', file.buffer, file.filename);
    return this.httpService
      .post<PredictionFromFlask>(url, data, {
        headers: {
          accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
        },
        responseType: 'json',
      })
      .pipe(
        map(async (json) => {
          const predictionFromFlask: PredictionFromFlask = json.data;
          const { logreg_pred, neural_net_pred, svclassifier_pred } = predictionFromFlask.prediction;
          const fileName = `${new Date().toISOString()}-${file.originalname}`;
          const imagesPath = path.join(this.configService.get<string>('faces_upload_path'), fileName);

          // Create folder if not exist
          if (!fs.existsSync(path.dirname(imagesPath))) {
            fs.mkdirSync(path.dirname(imagesPath), { recursive: true });
          }
          fs.writeFile(imagesPath, file.buffer, (error) => {
            if (error) {
              this.logger.error(
                `Error while saving image. UserId: ${userId}. Image path: ${imagesPath}. Error: ${error}`,
              );
            }
          });

          const isFake = this.isFakeImage(predictionFromFlask);
          const zoomed_image = Buffer.from(predictionFromFlask.zoomed_image, 'base64');
          const zoomedFileName = `${path.parse(fileName).name}_zoomed.avif`;
          const zoomedImagePath = path.join(
            this.configService.get<string>('faces_after_prediction_path'),
            isFake ? 'fake' : 'real',
            zoomedFileName,
          );

          // Create folder if not exist
          if (!fs.existsSync(path.dirname(zoomedImagePath))) {
            fs.mkdirSync(path.dirname(zoomedImagePath), { recursive: true });
          }

          // Convert to avif and save the zoomed image
          sharp(zoomed_image)
            .avif()
            .toFile(zoomedImagePath, (error, info) => {
              if (error) {
                this.logger.error(
                  `Error while converting to avif. UserId: ${userId}. Image path: ${zoomedImagePath}. Error: ${error}`,
                );
              }
            });

          // Save the image with the prediction in the database
          const image = await this.postgresPrismaService.image.create({
            data: {
              name: file.originalname,
              path: imagesPath,
              pathAfterZoom: zoomedImagePath,
              isFake: isFake,
              prediction: {
                create: {
                  logreg: logreg_pred === 1,
                  neural_net: neural_net_pred === 1,
                  svclassifier: svclassifier_pred === 1,
                  userId: userId,
                },
              },
            },
            include: {
              prediction: true,
            },
          });
          const prediction: PredictionPayload = {
            id: image.prediction.id,
            logreg: image.prediction.logreg,
            neural_net: image.prediction.neural_net,
            svclassifier: image.prediction.svclassifier,
            imageId: image.id,
            createdAt: image.createdAt,
          };
          this.logger.log(`User ${userId} predicted face. Image path: ${imagesPath}`);
          return prediction;
        }),
        catchError((error) => {
          let errCause = 'Something went wrong';
          if (isAxiosError(error) && error.response.data.message === 'No face detected') {
            errCause = error.response.data.message;
          }
          throw new HttpException(errCause, HttpStatus.BAD_REQUEST);
        }),
      );
  }

  private isFakeImage(predictionFromFlask: PredictionFromFlask): boolean {
    const { logreg_pred, neural_net_pred, svclassifier_pred } = predictionFromFlask.prediction;
    const pred1 = logreg_pred === 1;
    const pred2 = neural_net_pred === 1;
    const pred3 = svclassifier_pred === 1;
    return (pred1 && pred2) || (pred1 && pred3) || (pred2 && pred3);
  }

  async getPredictionsByUserId(id: number) {
    return await this.postgresPrismaService.prediction.findMany({
      where: {
        userId: id,
      },
    });
  }

  async getPredictionImage(userId: number, imageId: number) {
    const pred = await this.postgresPrismaService.prediction.findUnique({
      where: {
        id: imageId,
        userId: userId,
      },
      include: {
        image: true,
      },
    });

    const fileExists = await fs.promises.stat(pred.image.path).catch(() => false);
    if (!fileExists) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    } else {
      const fileReadStream = createReadStream(pred.image.path).on('error', (error) => {
        this.logger.error(`Error reading file. UserId: ${userId}. Image path: ${pred.image.path}. Error: ${error}`);
      });
      return new StreamableFile(fileReadStream);
    }
  }
  async deletePrediction(userId: number, predictionId: number) {
    const pred = await this.postgresPrismaService.prediction.findUnique({
      where: {
        id: predictionId,
        userId: userId,
      },
    });
    if (!pred) {
      throw new NotFoundException('Prediction not found');
    } else {
      const image = await this.postgresPrismaService.prediction.delete({
        where: {
          id: predictionId,
        },
        include: {
          image: true,
        },
      });
      fs.unlinkSync(image.image.path);
      fs.unlinkSync(image.image.pathAfterZoom);

      return image;
    }
  }
}

interface PredictionFromFlask {
  prediction: {
    logreg_pred: number;
    neural_net_pred: number;
    svclassifier_pred: number;
  };
  zoomed_image: string;
}
