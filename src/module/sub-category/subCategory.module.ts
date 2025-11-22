import { Module } from '@nestjs/common';
import { SubCategoryController } from './subCategory.controller';
import { SubCategoryService } from './subCategory.service';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
  SubCategoryModel,
  SubCategoryRepository,
  UserModel,
  UserRepository,
} from 'DB';
import { S3Service } from 'src/common/service';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [UserModel, BrandModel, CategoryModel, SubCategoryModel],
  controllers: [SubCategoryController],
  providers: [
    SubCategoryService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    CategoryRepository,
    SubCategoryRepository,
    S3Service,
    CategoryService,
  ],
})
export class SubCategoryModule {}
