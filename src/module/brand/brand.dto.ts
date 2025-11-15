import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { PartialType } from 'nestjs-mapped-types';
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

export class idDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: Types.ObjectId;
}
