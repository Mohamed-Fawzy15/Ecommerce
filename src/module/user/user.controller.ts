/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AddUserDto,
  confirmEmailDto,
  loginDto,
  reSendOtpDto,
} from './user.dto';

import { Auth, User } from 'src/common/decorators';
import type { HUserDocument } from 'DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerCloud, multerLocal } from 'src/common/multer';

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

  @Patch('confirmEmail')
  confirmEmail(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: confirmEmailDto,
  ) {
    return this.userService.confirmEmail(body);
  }

  @Post('login')
  login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: loginDto,
  ) {
    return this.userService.login(body);
  }

  @Auth()
  @Get('profile')
  profile(@User() user: HUserDocument) {
    return { message: 'profile', user };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  uploadFile(@UploadedFile(ParseFilePipe) file: Express.Multer.File) {
    return { message: 'done', file };
  }

  @Post('upload/cloud')
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerCloud({ fileTypes: fileValidation.image }),
    ),
  )
  uploadFileCloud(@UploadedFile(ParseFilePipe) file: Express.Multer.File) {
    return { message: 'done', file };
  }
}
