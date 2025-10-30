import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { AddUserDto, confirmEmailDto, reSendOtpDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AddUserDto,
  ) {
    return this.userService.signUp(body);
  }

  @Post('reSendOtp')
  reSendOtp(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: reSendOtpDto,
  ) {
    return this.userService.reSendOtp(body);
  }

  @Post('confirmEmail')
  confirmEmail(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: confirmEmailDto,
  ) {
    return this.userService.confirmEmail(body);
  }
}
