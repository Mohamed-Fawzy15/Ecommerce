import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorators';

export class reSendOtpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class confirmEmailDto extends reSendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}

export class loginDto extends reSendOtpDto {
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 15)
  fName: string;

  @IsNotEmpty()
  @Length(3, 15)
  lName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @Allow()
  @ValidateIf((data: AddUserDto) => {
    return Boolean(data.password);
  })
  @IsMatch(['password'])
  cPassword: string;

  @IsNotEmpty()
  @Min(18)
  @Max(600)
  @IsNumber()
  age: number;
}
