import { IsNotEmpty } from 'class-validator';

export class UserDeleteDto {
  @IsNotEmpty()
  readonly password: string;
}
