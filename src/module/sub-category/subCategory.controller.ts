import {
  Body,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SubCategoryService } from './subCategory.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerLocal } from 'src/common/multer';
import type { HUserDocument } from 'DB';
import { CreateSubCategoryDto } from './subCategory.dto';

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
    const category = await this.subCategoryService.createSubCategory(
      subCategoryDto,
      user,
      file,
    );
    return { message: 'done', category };
  }
}
