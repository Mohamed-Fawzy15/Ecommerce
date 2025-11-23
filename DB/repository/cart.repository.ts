import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Cart, HCartDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartRepository extends DbRepository<HCartDocument> {
  constructor(
    @InjectModel(Cart.name)
    protected override readonly model: Model<HCartDocument>,
  ) {
    super(model);
  }
}
