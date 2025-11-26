import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderModel } from 'DB/models/order.model';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import {
  CartModel,
  CartRepository,
  CouponModel,
  CouponRepository,
  OrderRepository,
  ProductModel,
  ProductRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { S3Service } from 'src/common/service';
import { StripeService } from 'src/common/service/stripe.service';

@Module({
  imports: [OrderModel, UserModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    TokenService,
    JwtService,
    UserRepository,
    OrderRepository,
    S3Service,
    CartRepository,
    ProductRepository,
    CouponRepository,
    StripeService,
  ],
})
export class OrderModule {}
