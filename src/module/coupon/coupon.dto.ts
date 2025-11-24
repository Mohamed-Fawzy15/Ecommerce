import { Type } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { CouponValidator } from 'src/common/decorators';

export class createCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  @Validate(CouponValidator)
  fromDate: Date;

  @IsDateString()
  @IsNotEmpty()
  toDate: Date;
}

export class updateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsOptional()
  code?: string;

  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  amount?: number;

  @IsDateString()
  @IsOptional()
  @Validate(CouponValidator)
  fromDate?: Date;

  @IsDateString()
  @IsOptional()
  toDate?: Date;
}

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
