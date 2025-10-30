import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OtpModel, UserModel } from 'DB/models';
import { OtpRepository, UserRepository } from 'DB';

@Module({
  imports: [UserModel, OtpModel],
  controllers: [UserController],
  providers: [UserService, UserRepository, OtpRepository],
})
export class UserModule {}
