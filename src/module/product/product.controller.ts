import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerLocal } from 'src/common/multer';
import type { HUserDocument } from 'DB';
import {
  CreateProductDto,
  idDto,
  queryDto,
  updateProductDto,
} from './product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 10 },
      ],
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Post()
  async createProduct(
    @Body() productDto: CreateProductDto,
    @User() user: HUserDocument,
    @UploadedFiles(ParseFilePipe)
    files: {
      mainImage: Express.Multer.File[];
      subImages: Express.Multer.File[];
    },
  ) {
    const product = await this.productService.createProduct(
      productDto,
      user,
      files,
    );
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('update/:id')
  async updateProduct(
    @Param() param: idDto,
    @Body() productDto: updateProductDto,
    @User() user: HUserDocument,
  ) {
    const product = await this.productService.updateProduct(
      productDto,
      user,
      param.id,
    );
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 10 },
      ],
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Patch('updateImage/:id')
  async updateProductImage(
    @Param() params: idDto,
    @User() user: HUserDocument,
    @UploadedFiles(ParseFilePipe)
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
  ) {
    const product = await this.productService.updateProductImage(
      params.id,
      files,
      user,
    );
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('freeze/:id')
  async freezeProduct(@Param() params: idDto, @User() user: HUserDocument) {
    const product = await this.productService.freezeProduct(params.id, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('restore/:id')
  async restoreProduct(@Param() params: idDto, @User() user: HUserDocument) {
    const product = await this.productService.restoreProduct(params.id, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Delete(':id')
  async deleteProduct(@Param() params: idDto) {
    const product = await this.productService.deleteProduct(params.id);
    return { message: 'done', product };
  }

  @Get()
  async getAllProducts(@Query() query: queryDto) {
    const products = await this.productService.getAllProducts(query);
    return { message: 'done', products };
  }

  @Post('addToWishlist/:id')
  @Auth({
    role: [UserRole.user, UserRole.admin],
    typeToken: TokenType.access,
  })
  async addToWishlist(@Param() param: idDto, @User() user: HUserDocument) {
    const userExist = await this.productService.addToWishlist(param.id, user);
    return { message: 'done', userExist };
  }
}
