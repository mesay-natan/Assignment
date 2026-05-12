import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsString, Length } from 'class-validator';
export class UpdateUserDto implements Partial<CreateUserDto> {
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsEmail()
  email?: string;
}
