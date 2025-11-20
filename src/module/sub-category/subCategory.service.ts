import { Category } from 'DB/models';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubCategoryDto } from './subCategory.dto';
import {
  BrandRepository,
  CategoryRepository,
  HUserDocument,
  SubCategoryRepository,
} from 'DB';
import { S3Service } from 'src/common/service';
import { randomUUID } from 'crypto';

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

    if (!subCategoryExists) {
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

    const assetFolderID = randomUUID();
    const url = await this.s3Service.uploadFile({
      path: `subCategories/${assetFolderID}`,
      file,
    });
  }
}
