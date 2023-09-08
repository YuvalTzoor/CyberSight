import { IsOptional, ValidateIf } from 'class-validator';
import {
  IsNotMatch,
  IsValidFirstName,
  IsValidLastName,
  IsValidNewPassword,
  IsValidPassword,
} from '../../shared/custom.validation';
export class UserUpdateDto {
  @IsOptional()
  @IsValidFirstName()
  readonly firstName?: string;
  @IsOptional()
  @IsValidLastName()
  readonly lastName?: string;

  @IsOptional()
  @IsValidPassword()
  readonly password?: string;

  @IsValidNewPassword()
  @IsNotMatch('password')
  @ValidateIf((o) => o.password)
  readonly newPassword: string;
}
