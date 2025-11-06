/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OtpModel, UserModel } from 'DB/models';
import { OtpRepository, UserRepository } from 'DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/service/token/token.service';

@Module({
  imports: [UserModel, OtpModel],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    OtpRepository,
    JwtService,
    TokenService,
  ],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(tokenType(), AuthenticationMiddleware)
  //     .exclude(
  //       {
  //         path: 'users/login',
  //         method: RequestMethod.POST,
  //       },
  //       {
  //         path: 'users/signup',
  //         method: RequestMethod.POST,
  //       },
  //     )
  //     .forRoutes({
  //       path: 'users/*demo',
  //       method: RequestMethod.ALL,
  //     });
  // }
}
