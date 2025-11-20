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
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  idDto,
  queryDto,
  updateCategoryDto,
} from './category.dto';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerLocal } from 'src/common/multer';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Post()
  async createCategory(
    @Body() categoryDto: CreateCategoryDto,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const category = await this.categoryService.createCategory(
      categoryDto,
      user,
      file,
    );
    return { message: 'done', category };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('update/:id')
  async updateCategory(
    @Param() params: idDto,
    @Body() categoryDto: updateCategoryDto,
    @User() user: HUserDocument,
  ) {
    const category = await this.categoryService.updateCategory(
      params.id,
      categoryDto,
      user,
    );
    return { message: 'done', category };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Patch('updateImage/:id')
  async updateCategoryImage(
    @Param() params: idDto,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const category = await this.categoryService.updateCategoryImage(
      params.id,
      file,
      user,
    );
    return { message: 'done', category };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('freeze/:id')
  async freezeCategory(@Param() params: idDto, @User() user: HUserDocument) {
    const category = await this.categoryService.freezeCategory(params.id, user);
    return { message: 'done', category };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('restore/:id')
  async restoreCategory(@Param() params: idDto, @User() user: HUserDocument) {
    const category = await this.categoryService.restoreCategory(
      params.id,
      user,
    );
    return { message: 'done', category };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Delete(':id')
  async deleteCategory(@Param() params: idDto) {
    const category = await this.categoryService.deleteCategory(params.id);
    return { message: 'done', category };
  }

  @Get()
  async getAllCategories(@Query() query: queryDto) {
    const categories = await this.categoryService.getAllCategories(query);
    return { message: 'done', categories };
  }
}
