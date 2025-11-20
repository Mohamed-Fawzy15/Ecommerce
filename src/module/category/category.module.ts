import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { S3Service } from 'src/common/service';

@Module({
  imports: [UserModel, BrandModel, CategoryModel],
  controllers: [CategoryController],
  providers: [
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    CategoryRepository,
    S3Service,
    CategoryService,
  ],
})
export class CategoryModule {}
