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
import { PartialType } from '@nestjs/mapped-types';
import { AtLeastOne, IdsMongo } from 'src/common/decorators';

export class CreateCategoryDto {
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
}

@AtLeastOne(['name', 'slogan'])
export class updateCategoryDto extends PartialType(CreateCategoryDto) {}

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
