import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Brand, HBrandDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandRepository extends DbRepository<HBrandDocument> {
  constructor(
    @InjectModel(Brand.name)
    protected override readonly model: Model<HBrandDocument>,
  ) {
    super(model);
  }
}
