import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import configuration from 'src/config/configuration';
import { imageValidationConfig } from '@final-project/shared';

export const editFileName = (req, file: Express.Multer.File, callback) => {
  const fileName = generateFileName(file, req.user?.id);
  callback(null, fileName);
};

export const imageFileFilter = (req, file: Express.Multer.File, callback) => {
  const lowerCaseOriginalname = file.originalname.toLowerCase();
  if (!lowerCaseOriginalname.match(`\\.(${imageValidationConfig.allowedExtensions.join('|')})$`)) {
    return callback(
      new BadRequestException(
        `The format of ${file.originalname} is not supported. Only ${imageValidationConfig.allowedExtensions.join(
          ', ',
        )} are supported.`,
      ),
      false,
    );
  }

  callback(null, true);
};

export const multerOptionsMemoryStorage: MulterOptions = {
  fileFilter: imageFileFilter,
  storage: memoryStorage(),
  limits: {
    fileSize: imageValidationConfig.maxSize,
  },
};

const getDiskStorage = (filePath: string) => {
  return diskStorage({
    destination: filePath,
    filename: editFileName,
  });
};

export const multerOptionsProfileImage = {
  fileFilter: imageFileFilter,
  storage: getDiskStorage(process.env.PROFILE_IMAGES_PATH || configuration().profile_images_path),
  fileSize: imageValidationConfig.maxSize,
};

export const generateFileName = (file: Express.Multer.File, id: string) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomNums = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  return `${new Date().toISOString()}-${randomNums}-${id}-${name}-${fileExtName}`;
};
