import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Product, HProductDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductRepository extends DbRepository<HProductDocument> {
  constructor(
    @InjectModel(Product.name)
    protected override readonly model: Model<HProductDocument>,
  ) {
    super(model);
  }
}
