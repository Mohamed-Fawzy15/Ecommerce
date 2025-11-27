import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import {
  CartModel,
  CartRepository,
  ProductModel,
  ProductRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { TokenService } from 'src/common/service/token/token.service';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { SocketGateway } from '../gateway/socket.gatewat';

@Module({
  imports: [UserModule, CartModel, ProductModel, UserModel],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    ProductRepository,
    UserRepository,
    TokenService,
    JwtService,
    SocketGateway,
  ],
})
export class CartModule {}
