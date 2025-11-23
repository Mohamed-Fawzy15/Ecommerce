import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { PartialType } from '@nestjs/mapped-types';
import { AtLeastOne, IdsMongo } from 'src/common/decorators';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10000)
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsMongoId()
  brand: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsMongoId()
  @IsNotEmpty()
  subCategory: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discount: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  stock: number;
}

@AtLeastOne([
  'name',
  'description',
  'brand',
  'category',
  'subCategory',
  'price',
  'discount',
  'quantity',
  'stock',
])
export class updateProductDto extends PartialType(CreateProductDto) {}

export class queryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class idDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: Types.ObjectId;
}
