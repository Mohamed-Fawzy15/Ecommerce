import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
  ProductModel,
  ProductRepository,
  SubCategoryModel,
  SubCategoryRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { SubCategoryService } from '../sub-category/subCategory.service';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/common/service';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [
    UserModel,
    BrandModel,
    CategoryModel,
    SubCategoryModel,
    ProductModel,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    SubCategoryService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    CategoryRepository,
    SubCategoryRepository,
    ProductRepository,
    S3Service,
    CategoryService,
  ],
})
export class ProductModule {}
