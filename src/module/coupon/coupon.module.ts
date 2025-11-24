import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import {
  CouponModel,
  CouponRepository,
  ProductModel,
  ProductRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CouponModel, UserModel, ProductModel],
  controllers: [CouponController],
  providers: [
    CouponService,
    CouponRepository,
    UserRepository,
    ProductRepository,
    TokenService,
    JwtService,
  ],
})
export class CouponModule {}
