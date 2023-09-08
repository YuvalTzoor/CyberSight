import { IsNotEmpty } from 'class-validator';
import { IsValidEmail, IsValidPassword } from '../../shared/custom.validation';
export class UserLoginDto {
  @IsNotEmpty()
  @IsValidEmail()
  readonly email: string;
  @IsNotEmpty()
  @IsValidPassword()
  readonly password: string;
}
