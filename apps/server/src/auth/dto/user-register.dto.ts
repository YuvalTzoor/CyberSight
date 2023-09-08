import { IsNotEmpty } from 'class-validator';
import { IsValidEmail, IsValidFirstName, IsValidLastName, IsValidPassword } from '../../shared/custom.validation';
export class UserRegisterDto {
  @IsNotEmpty()
  @IsValidFirstName()
  readonly firstName: string;

  @IsNotEmpty()
  @IsValidLastName()
  readonly lastName: string;

  @IsNotEmpty()
  @IsValidEmail()
  readonly email: string;
  @IsNotEmpty()
  @IsValidPassword()
  readonly password: string;
}
