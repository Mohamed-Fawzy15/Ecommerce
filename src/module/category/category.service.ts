/* eslint-disable @typescript-eslint/require-await */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, queryDto, updateCategoryDto } from './category.dto';
import { BrandRepository, CategoryRepository, HUserDocument } from 'DB';
import { Types } from 'mongoose';
import { S3Service } from 'src/common/service';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}

  async createCategory(
    CategoryDto: CreateCategoryDto,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    const { name, slogan, brands } = CategoryDto;
    const existCategory = await this.categoryRepo.findOne({ filter: { name } });
    if (existCategory) {
      throw new ConflictException('Category Name already exists');
    }

    const strictIds = [...new Set(brands || [])];

    if (
      brands &&
      (await this.brandRepo.find({ filter: { _id: { $in: strictIds } } }))
        .length != strictIds.length
    ) {
      throw new NotFoundException('brands not found');
    }

    const assetFolderID = randomUUID();
    const url = await this.s3Service.uploadFile({
      path: `Categories/${assetFolderID}`,
      file,
    });

    const Category = await this.categoryRepo.create({
      name,
      slogan,
      image: file.path,
      createdBy: user._id,
      assetFolderID,
    });

    if (!Category) {
      await this.s3Service.deleteFile({ Key: url });
      throw new InternalServerErrorException('failed to create Category');
    }

    return Category;
  }

  async updateCategory(
    id: Types.ObjectId,
    CategoryDto: updateCategoryDto,
    user: HUserDocument,
  ) {
    const { name, slogan, brands } = CategoryDto;
    const Category = await this.categoryRepo.findOne({
      _id: id,
      createdBy: user._id,
    });
    if (!Category) {
      throw new NotFoundException('Category not found');
    }

    if (name && (await this.categoryRepo.findOne({ filter: { name } }))) {
      throw new ConflictException('Category name is already exists');
    }
    const strictIds = [...new Set(brands || [])];

    if (
      brands &&
      (await this.brandRepo.find({ filter: { _id: { $in: strictIds } } }))
        .length != strictIds.length
    ) {
      throw new NotFoundException('brands not found');
    }

    if (slogan) {
      Category.slogan = slogan;
    }

    Category.name = name as unknown as string;
    await Category.save();
  }

  async updateCategoryImage(
    id: Types.ObjectId,
    file: Express.Multer.File,
    user: HUserDocument,
  ) {
    const Category = await this.categoryRepo.findOne({
      filter: { _id: id, createdBy: user._id },
    });
    if (!Category) {
      throw new NotFoundException('Category not found');
    }

    const url = await this.s3Service.uploadFile({
      path: `Categories/${Category.assetFolderID}`,
      file,
    });

    const updatedCategory = await this.categoryRepo.findOneAndUpdate(
      { _id: id },
      { image: url },
    );

    if (!updatedCategory) {
      await this.s3Service.deleteFile({
        Key: url,
      });
      throw new InternalServerErrorException('failed to update Category image');
    }

    await this.s3Service.deleteFile({ Key: Category.image });

    return updatedCategory;
  }

  async freezeCategory(id: Types.ObjectId, user: HUserDocument) {
    const Category = await this.categoryRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date(), updatedBy: user._id },
    );

    if (!Category) {
      throw new NotFoundException('Category not found or already deleted');
    }

    return Category;
  }

  async restoreCategory(id: Types.ObjectId, user: HUserDocument) {
    const Category = await this.categoryRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true }, paranoid: false },
      {
        $unset: { deletedAt: '' },
        restoredAt: new Date(),
        updatedBy: user._id,
      },
    );

    if (!Category) {
      throw new NotFoundException('Category not found or already restored');
    }

    return Category;
  }

  async deleteCategory(id: Types.ObjectId) {
    const Category = await this.categoryRepo.findOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    if (!Category) {
      throw new NotFoundException('Category not found or already deleted');
    }

    await this.s3Service.deleteFile({ Key: Category.image });

    const deletedCategory = await this.categoryRepo.deleteOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    return deletedCategory;
  }

  // resume it from the social media app
  async getAllCategories(query: queryDto) {
    const { page = 1, limit = 10, search } = query;
    const { currentPage, countDoc, totalPages, result } =
      await this.categoryRepo.paginate({
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
    return { currentPage, countDoc, totalPages, result };
  }
}
