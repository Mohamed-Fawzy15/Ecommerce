import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  BrandRepository,
  CategoryRepository,
  HUserDocument,
  ProductRepository,
  SubCategoryRepository,
  UserRepository,
} from 'DB';
import { S3Service } from 'src/common/service';
import { CreateProductDto, queryDto, updateProductDto } from './product.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
    private readonly subCategoryRepo: SubCategoryRepository,
    private readonly productRepo: ProductRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createProduct(
    productDto: CreateProductDto,
    user: HUserDocument,
    files: {
      mainImage: Express.Multer.File[];
      subImages: Express.Multer.File[];
    },
  ) {
    let {
      name,
      description,
      brand,
      category,
      subCategory,
      price,
      discount,
      quantity,
      stock,
    } = productDto;

    const productExist = await this.productRepo.findOne({ name });

    if (productExist) throw new ConflictException('product name already exist');

    const brandExist = await this.brandRepo.findOne({ _id: brand });
    if (!brandExist) throw new NotFoundException('brand not found');

    const categoryExist = await this.categoryRepo.findOne({ _id: category });
    if (!categoryExist) throw new NotFoundException('category not found');

    const subCategoryExist = await this.subCategoryRepo.findOne({
      _id: subCategory,
    });
    if (!subCategoryExist) throw new NotFoundException('subCategory not found');

    if (stock > quantity)
      throw new BadRequestException('stock must be less than quantity');

    price = price - price * ((discount || 0) / 100);

    const filePath = files.mainImage[0];
    const filesPath = files.subImages;

    const mainImage = await this.s3Service.uploadFile({
      file: filePath,
      path: `Category/${categoryExist.assetFolderID}/products/mainImage`,
    });

    const subImages = await this.s3Service.uploadFiles({
      files: filesPath,
      path: `Category/${categoryExist.assetFolderID}/products/subImages`,
    });

    const product = await this.productRepo.create({
      name,
      description,
      brand: new Types.ObjectId(brand),
      category: new Types.ObjectId(category),
      subCategory: new Types.ObjectId(subCategory),
      price,
      discount,
      quantity,
      stock,
      mainImage,
      subImages,
      createdBy: user._id,
    });

    if (!product) {
      await this.s3Service.deleteFile({ Key: mainImage });
      await this.s3Service.deleteFiles({ urls: subImages, Quiet: false });
      throw new InternalServerErrorException('failed to create product');
    }

    return product;
  }

  async updateProduct(
    productDto: updateProductDto,
    user: HUserDocument,
    id: Types.ObjectId,
  ) {
    let {
      name,
      description,
      brand,
      category,
      subCategory,
      price,
      discount,
      quantity,
      stock,
    } = productDto;

    let product = await this.productRepo.findOne({ _id: id });
    if (!product) throw new NotFoundException('product not found');

    if (category) {
      const categoryExist = await this.categoryRepo.findOne({ _id: category });
      if (!categoryExist) throw new NotFoundException('category not found');
    }
    if (subCategory) {
      const subCategoryExist = await this.subCategoryRepo.findOne({
        _id: subCategory,
      });
      if (!subCategoryExist)
        throw new NotFoundException('subCategory not found');
    }
    if (brand) {
      const brandExist = await this.brandRepo.findOne({ _id: brand });
      if (!brandExist) throw new NotFoundException('brand not found');
    }

    if (price && discount) {
      price = price - price * (discount / 100);
    } else if (price) {
      price = price - price * (product.discount / 100);
    } else if (discount) {
      price = product.price - product.price * (discount / 100);
    }

    if (stock) {
      if (stock > product.quantity) {
        throw new BadRequestException('stock must be less than quantity');
      }
    }

    product = await this.productRepo.findOneAndUpdate(
      { _id: id },
      {
        ...productDto,
        price,
        discount,
        stock,
        quantity,
      },
    );

    return { product };
  }

  async updateProductImage(
    id: Types.ObjectId,
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    user: HUserDocument,
  ) {
    const product = await this.productRepo.findOne({
      _id: id,
      createdBy: user._id,
    });
    if (!product) throw new NotFoundException('product not found');

    const category = await this.categoryRepo.findOne({ _id: product.category });
    if (!category) throw new NotFoundException('category not found');

    const oldMainImage = product.mainImage;
    const oldSubImages = product.subImages;

    const updateData: { mainImage?: string; subImages?: string[] } = {};
    const newUploadedFiles: { mainImage?: string; subImages?: string[] } = {};

    if (files.mainImage && files.mainImage.length > 0) {
      const mainImage = await this.s3Service.uploadFile({
        file: files.mainImage[0],
        path: `Category/${category.assetFolderID}/products/mainImage`,
      });
      updateData.mainImage = mainImage;
      newUploadedFiles.mainImage = mainImage;
    }

    if (files.subImages && files.subImages.length > 0) {
      const subImages = await this.s3Service.uploadFiles({
        files: files.subImages,
        path: `Category/${category.assetFolderID}/products/subImages`,
      });
      updateData.subImages = subImages;
      newUploadedFiles.subImages = subImages;
    }

    const updatedProduct = await this.productRepo.findOneAndUpdate(
      { _id: id },
      updateData,
    );

    if (!updatedProduct) {
      if (newUploadedFiles.mainImage) {
        await this.s3Service.deleteFile({ Key: newUploadedFiles.mainImage });
      }
      if (newUploadedFiles.subImages) {
        await this.s3Service.deleteFiles({
          urls: newUploadedFiles.subImages,
          Quiet: false,
        });
      }
      throw new InternalServerErrorException('failed to update product image');
    }

    if (newUploadedFiles.mainImage && oldMainImage) {
      await this.s3Service.deleteFile({ Key: oldMainImage });
    }
    if (newUploadedFiles.subImages && oldSubImages && oldSubImages.length > 0) {
      await this.s3Service.deleteFiles({ urls: oldSubImages, Quiet: false });
    }

    return updatedProduct;
  }

  async freezeProduct(id: Types.ObjectId, user: HUserDocument) {
    const product = await this.productRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { deletedAt: new Date(), updatedBy: user._id },
    );

    if (!product) {
      throw new NotFoundException('Product not found or already deleted');
    }

    return product;
  }

  async restoreProduct(id: Types.ObjectId, user: HUserDocument) {
    const product = await this.productRepo.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: true }, paranoid: false },
      {
        $unset: { deletedAt: '' },
        restoredAt: new Date(),
        updatedBy: user._id,
      },
    );

    if (!product) {
      throw new NotFoundException('Product not found or already restored');
    }

    return product;
  }

  async deleteProduct(id: Types.ObjectId) {
    const product = await this.productRepo.findOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    if (!product) {
      throw new NotFoundException('Product not found or not frozen');
    }

    await this.s3Service.deleteFile({ Key: product.mainImage });

    if (product.subImages && product.subImages.length > 0) {
      await this.s3Service.deleteFiles({
        urls: product.subImages,
        Quiet: false,
      });
    }

    const deletedProduct = await this.productRepo.deleteOne({
      _id: id,
      deletedAt: { $exists: true },
      paranoid: false,
    });

    return deletedProduct;
  }

  async getAllProducts(query: queryDto) {
    const { page = 1, limit = 10, search } = query;
    const { currentPage, countDoc, totalPages, result } =
      await this.productRepo.paginate({
        filter: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
        },
        query: { page, limit },
      });
    return { currentPage, countDoc, totalPages, result };
  }

  async addToWishlist(id: Types.ObjectId, user: HUserDocument) {
    const product = await this.productRepo.findOne({ _id: id });
    if (!product) throw new NotFoundException('product not found');

    let userExist = await this.userRepo.findOneAndUpdate(
      { _id: user._id, wishlist: { $in: id } },
      { $pull: { wishlist: id } },
    );
    if (!userExist) {
      userExist = await this.userRepo.findOneAndUpdate(
        { _id: user._id },
        { $push: { wishlist: id } },
      );
    }

    return { userExist };
  }
}
