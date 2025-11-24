import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { Coupon, HCouponDocument } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CouponRepository extends DbRepository<HCouponDocument> {
  constructor(
    @InjectModel(Coupon.name)
    protected override readonly model: Model<HCouponDocument>,
  ) {
    super(model);
  }
}
