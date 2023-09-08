const imageMaxSize = 1024 * 1024 * 10; // 10MB
const allowedExtensions = ['jpg', 'jpeg', 'png', 'jfif'] as const;
const allowedTypes = ['image/jpeg', 'image/png'] as const;

export const imageValidationConfig = {
  maxSize: imageMaxSize,
  allowedExtensions,
  allowedTypes,
} as const;
