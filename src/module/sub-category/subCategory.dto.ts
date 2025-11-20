import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { PartialType } from 'nestjs-mapped-types';
import { AtLeastOne, IdsMongo } from 'src/common/decorators';

export class CreateSubCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @IsNotEmpty()
  slogan: string;

  @Validate(IdsMongo)
  @IsOptional()
  brands: Types.ObjectId[];

  @Validate(IdsMongo)
  @IsOptional()
  category: Types.ObjectId[];
}

@AtLeastOne(['name', 'slogan'])
export class updateSubCategoryDto extends PartialType(CreateSubCategoryDto) {}

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
