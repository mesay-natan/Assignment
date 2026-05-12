import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  firstName!: string;

  @IsString()
  @Length(2, 50)
  lastName!: string;

  @IsEmail()
  email!: string;
}
