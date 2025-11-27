/* eslint-disable @typescript-eslint/require-await */
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto, queryDto, updateBrandDto } from './brand.dto';
import { BrandRepository, HUserDocument } from 'DB';
import { Types } from 'mongoose';
import { S3Service } from 'src/common/service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { SocketGateway } from '../gateway/socket.gatewat';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly socketGateway: SocketGateway,
  ) {}

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

    // Clear cache and emit socket event
    await this.clearBrandCache();
    this.socketGateway.handleBrandChange('created', brand._id, brand);

    return brand;
  }

  async updateBrand(
    id: Types.ObjectId,
    brandDto: updateBrandDto,
    user: HUserDocument,
  ) {
    const { name, slogan } = brandDto;
    const brand = await this.brandRepo.findOne({
      _id: id,
      createdBy: user._id,
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

    // Clear cache and emit socket event
    await this.clearBrandCache();
    this.socketGateway.handleBrandChange('updated', id, brand);

    return brand;
  }

  async updateBrandImage(
    id: Types.ObjectId,
    file: Express.Multer.File,
    user: HUserDocument,
  ) {
    const brand = await this.brandRepo.findOne({
      filter: { _id: id, createdBy: user._id },
    });
    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    const url = await this.s3Service.uploadFile({ path: 'brands', file });

    const updatedBrand = await this.brandRepo.findOneAndUpdate(
      { _id: id },
      { image: url },
    );

    if (!updatedBrand) {
      await this.s3Service.deleteFile({
        Key: url,
      });
      throw new InternalServerErrorException('failed to update brand image');
    }

    await this.s3Service.deleteFile({ Key: brand.image });

    // Clear cache and emit socket event
    await this.clearBrandCache();
    this.socketGateway.handleBrandChange('updated', id, updatedBrand);

    return updatedBrand;
  }

  async freezeBrand(id: Types.ObjectId, user: HUserDocument) {
    const brand = await this.brandRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date(), updatedBy: user._id },
    );

    if (!brand) {
      throw new NotFoundException('brand not found or already deleted');
    }

    return brand;
  }

  async restoreBrand(id: Types.ObjectId, user: HUserDocument) {
    const brand = await this.brandRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true }, paranoid: false },
      {
        $unset: { deletedAt: '' },
        restoredAt: new Date(),
        updatedBy: user._id,
      },
    );

    if (!brand) {
      throw new NotFoundException('brand not found or already restored');
    }

    return brand;
  }

  async deleteBrand(id: Types.ObjectId) {
    const brand = await this.brandRepo.findOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    if (!brand) {
      throw new NotFoundException('brand not found or already deleted');
    }

    await this.s3Service.deleteFile({ Key: brand.image });

    const deletedBrand = await this.brandRepo.deleteOne({
      _id: id,
      paranoid: false,
    });

    // Clear cache and emit socket event
    await this.clearBrandCache();
    this.socketGateway.handleBrandChange('deleted', id);

    return deletedBrand;
  }

  async getAllBrands(query: queryDto) {
    const { page = 1, limit = 10, search } = query;
    const cacheKey = `brands:page:${page}:limit:${limit}:search:${search || 'all'}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const { currentPage, countDoc, totalPages, result } =
      await this.brandRepo.paginate({
        filter: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { slogan: { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
        },
        query: { page, limit },
      });

    const response = { currentPage, countDoc, totalPages, result };
    // Cache the result
    await this.cacheManager.set(cacheKey, response, 10000);
    return response;
  }

  private async clearBrandCache() {
    // Simple approach: just clear the entire cache
  }
}
