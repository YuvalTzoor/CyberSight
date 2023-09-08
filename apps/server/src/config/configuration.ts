import { EnvConfig } from './config.interface';

export default (): EnvConfig => ({
  port: parseInt(process.env.SERVER_PORT, 10) || 3000,
  faces_after_prediction_path: process.env.FACES_AFTER_PREDICTION_PATH || 'static/faces_after_prediction',
  faces_upload_path: process.env.FACES_UPLOAD_PATH || 'static/uploads/faces',
  profile_images_path: process.env.PROFILE_IMAGES_PATH || 'static/uploads/profile_images',
  flask_url: process.env.FLASK_URL || 'http://localhost:5000',
  cors: {
    enabled: true,
  },
  security: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION || '10m',
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION || '10d',
    bcryptSaltOrRound: 10,
  },
});
