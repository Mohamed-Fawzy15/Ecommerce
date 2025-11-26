import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Order, HOrderDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository extends DbRepository<HOrderDocument> {
  constructor(
    @InjectModel(Order.name)
    protected override readonly model: Model<HOrderDocument>,
  ) {
    super(model);
  }
}
