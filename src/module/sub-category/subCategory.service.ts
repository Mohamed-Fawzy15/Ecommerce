import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateSubCategoryDto,
  queryDto,
  updateSubCategoryDto,
} from './subCategory.dto';
import {
  BrandRepository,
  CategoryRepository,
  HUserDocument,
  SubCategoryRepository,
} from 'DB';
import { S3Service } from 'src/common/service';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class SubCategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
    private readonly subCategoryRepo: SubCategoryRepository,
  ) {}

  async createSubCategory(
    subCategoryDto: CreateSubCategoryDto,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    const { name, slogan, brands, category } = subCategoryDto;

    const subCategoryExists = await this.subCategoryRepo.findOne({
      filter: { name },
    });

    if (subCategoryExists) {
      throw new ConflictException('sub Category Name already exists ');
    }

    const strictIds = [...new Set(brands || [])];

    if (
      brands &&
      (await this.brandRepo.find({ filter: { _id: { $in: strictIds } } }))
        .length != strictIds.length
    ) {
      throw new NotFoundException('brands not found');
    }
    const categoryExists = await this.categoryRepo.findOne({
      filter: { _id: category },
    });
    if (!categoryExists) {
      throw new NotFoundException('category not found');
    }

    const assetFolderID = randomUUID();
    const url = await this.s3Service.uploadFile({
      path: `subCategories/${assetFolderID}`,
      file,
    });

    const subCategory = await this.subCategoryRepo.create({
      name,
      slogan,
      image: url,
      createdBy: user._id,
      assetFolderID,
      category: categoryExists._id,
      brands: strictIds,
    });

    if (!subCategory) {
      await this.s3Service.deleteFile({ Key: url });
      throw new InternalServerErrorException('failed to create subCategory');
    }

    return subCategory;
  }

  async updateSubCategory(
    id: Types.ObjectId,
    subCategoryDto: updateSubCategoryDto,
    user: HUserDocument,
  ) {
    const { name, slogan, brands } = subCategoryDto;
    const subCategory = await this.subCategoryRepo.findOne({
      _id: id,
      createdBy: user._id,
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    if (name && (await this.subCategoryRepo.findOne({ filter: { name } }))) {
      throw new ConflictException('SubCategory name is already exists');
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
      subCategory.slogan = slogan;
    }

    if (name) {
      subCategory.name = name as unknown as string;
    }

    if (brands) {
      subCategory.brands = strictIds as unknown as Types.ObjectId[];
    }

    await subCategory.save();
  }

  async updateSubCategoryImage(
    id: Types.ObjectId,
    file: Express.Multer.File,
    user: HUserDocument,
  ) {
    const subCategory = await this.subCategoryRepo.findOne({
      filter: { _id: id, createdBy: user._id },
    });
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    const url = await this.s3Service.uploadFile({
      path: `subCategories/${subCategory.assetFolderID}`,
      file,
    });

    const updatedSubCategory = await this.subCategoryRepo.findOneAndUpdate(
      { _id: id },
      { image: url },
    );

    if (!updatedSubCategory) {
      await this.s3Service.deleteFile({
        Key: url,
      });
      throw new InternalServerErrorException(
        'failed to update SubCategory image',
      );
    }

    await this.s3Service.deleteFile({ Key: subCategory.image });

    return updatedSubCategory;
  }

  async freezeSubCategory(id: Types.ObjectId, user: HUserDocument) {
    const subCategory = await this.subCategoryRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date(), updatedBy: user._id },
    );

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found or already deleted');
    }

    return subCategory;
  }

  async restoreSubCategory(id: Types.ObjectId, user: HUserDocument) {
    const subCategory = await this.subCategoryRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true }, paranoid: false },
      {
        $unset: { deletedAt: '' },
        restoredAt: new Date(),
        updatedBy: user._id,
      },
    );

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found or already restored');
    }

    return subCategory;
  }

  async deleteSubCategory(id: Types.ObjectId) {
    const subCategory = await this.subCategoryRepo.findOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found or already deleted');
    }

    await this.s3Service.deleteFile({ Key: subCategory.image });

    const deletedSubCategory = await this.subCategoryRepo.deleteOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    return deletedSubCategory;
  }

  async getAllSubCategories(query: queryDto) {
    const { page = 1, limit = 10, search } = query;
    const { currentPage, countDoc, totalPages, result } =
      await this.subCategoryRepo.paginate({
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
