/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto, idDto, updateBrandDto } from './brand.dto';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileValidation, multerLocal } from 'src/common/multer';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      multerLocal({ fileTypes: fileValidation.image }),
    ),
  )
  @Post()
  async createBrand(
    @Body() brandDto: CreateBrandDto,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const brand = this.brandService.createdBrand(brandDto, user, file);
    return { message: 'done', brand };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('update/:id')
  async updateBrand(
    @Param() params: idDto,
    @Body() brandDto: updateBrandDto,
    @User() user: HUserDocument,
  ) {
    const brand = this.brandService.updateBrand(params.id, brandDto, user);
    return { message: 'done', brand };
  }
}
