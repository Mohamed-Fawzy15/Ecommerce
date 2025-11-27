import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { BrandModel, BrandRepository, UserModel, UserRepository } from 'DB';
import { S3Service } from 'src/common/service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [UserModel, BrandModel, GatewayModule],
  controllers: [BrandController],
  providers: [
    BrandService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    S3Service,
  ],
})
export class BrandModule {}
