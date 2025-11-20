import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Category, HCategoryDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends DbRepository<HCategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    protected override readonly model: Model<HCategoryDocument>,
  ) {
    super(model);
  }
}
