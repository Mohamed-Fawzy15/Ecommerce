import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { SubCategory, HSubCategoryDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubCategoryRepository extends DbRepository<HSubCategoryDocument> {
  constructor(
    @InjectModel(SubCategory.name)
    protected override readonly model: Model<HSubCategoryDocument>,
  ) {
    super(model);
  }
}
