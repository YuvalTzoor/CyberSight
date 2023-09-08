export interface EnvConfig {
  port: number;
  faces_upload_path: string;
  faces_after_prediction_path: string;
  flask_url: string;
  profile_images_path: string;
  cors: CorsConfig;
  security: SecurityConfig;
}
export interface CorsConfig {
  enabled: boolean;
}
export interface SecurityConfig {
  jwt_access_secret: string;
  jwt_access_expiration: string;
  jwt_refresh_secret: string;
  jwt_refresh_expiration: string;
  bcryptSaltOrRound: string | number;
}
