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
} from 'class-validator';
import { Types } from 'mongoose';
import { PartialType } from '@nestjs/mapped-types';
import { AtLeastOne } from 'src/common/decorators';

export class CreateBrandDto {
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
}

@AtLeastOne(['name', 'slogan'])
export class updateBrandDto extends PartialType(CreateBrandDto) {}

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
