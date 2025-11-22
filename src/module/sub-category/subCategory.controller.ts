/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SubCategoryService } from './subCategory.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerLocal } from 'src/common/multer';
import type { HUserDocument } from 'DB';
import {
  CreateSubCategoryDto,
  idDto,
  queryDto,
  updateSubCategoryDto,
} from './subCategory.dto';

@Controller('subCategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Post()
  async createSubCategory(
    @Body() subCategoryDto: CreateSubCategoryDto,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const subCategory = await this.subCategoryService.createSubCategory(
      subCategoryDto,
      user,
      file,
    );
    return { message: 'done', subCategory };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('update/:id')
  async updateSubCategory(
    @Param() params: idDto,
    @Body() subCategoryDto: updateSubCategoryDto,
    @User() user: HUserDocument,
  ) {
    const subCategory = await this.subCategoryService.updateSubCategory(
      params.id,
      subCategoryDto,
      user,
    );
    return { message: 'done', subCategory };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Patch('updateImage/:id')
  async updateSubCategoryImage(
    @Param() params: idDto,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const subCategory = await this.subCategoryService.updateSubCategoryImage(
      params.id,
      file,
      user,
    );
    return { message: 'done', subCategory };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('freeze/:id')
  async freezeSubCategory(@Param() params: idDto, @User() user: HUserDocument) {
    const subCategory = await this.subCategoryService.freezeSubCategory(
      params.id,
      user,
    );
    return { message: 'done', subCategory };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('restore/:id')
  async restoreSubCategory(
    @Param() params: idDto,
    @User() user: HUserDocument,
  ) {
    const subCategory = await this.subCategoryService.restoreSubCategory(
      params.id,
      user,
    );
    return { message: 'done', subCategory };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Delete(':id')
  async deleteSubCategory(@Param() params: idDto) {
    const subCategory = await this.subCategoryService.deleteSubCategory(
      params.id,
    );
    return { message: 'done', subCategory };
  }

  @Get()
  async getAllSubCategories(@Query() query: queryDto) {
    const subCategories =
      await this.subCategoryService.getAllSubCategories(query);
    return { message: 'done', subCategories };
  }
}
