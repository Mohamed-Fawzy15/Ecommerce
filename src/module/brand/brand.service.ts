/* eslint-disable @typescript-eslint/require-await */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto, updateBrandDto } from './brand.dto';
import { BrandRepository, HUserDocument } from 'DB';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) {}

  async createdBrand(
    brandDto: CreateBrandDto,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    const { name, slogan } = brandDto;
    const existBrand = await this.brandRepo.findOne({ filter: { name } });
    if (existBrand) {
      throw new ConflictException('Brand Name already exists');
    }

    const brand = await this.brandRepo.create({
      name,
      slogan,
      image: file.path,
      createdBy: user._id,
    });

    if (!brand) {
      throw new InternalServerErrorException('failed to create brand');
    }

    return brand;
  }

  async updateBrand(
    id: Types.ObjectId,
    brandDto: updateBrandDto,
    user: HUserDocument,
  ) {
    const { name, slogan } = brandDto;
    const brand = await this.brandRepo.findOne({
      filter: { _id: id, crearedBy: user._id },
    });
    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    if (name && (await this.brandRepo.findOne({ filter: { name } }))) {
      throw new ConflictException('brand name is already exists');
    }

    if (slogan) {
      brand.slogan = slogan;
    }

    brand.name = name as unknown as string;
    await brand.save();
  }
}
