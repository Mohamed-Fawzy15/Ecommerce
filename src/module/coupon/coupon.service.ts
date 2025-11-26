import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createCouponDto, updateCouponDto } from './coupon.dto';
import { CouponRepository, HUserDocument } from 'DB';
import { Types } from 'mongoose';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepo: CouponRepository) {}

  async createCoupon(couponDto: createCouponDto, user: HUserDocument) {
    const { code, amount, fromDate, toDate } = couponDto;

    const couponExist = await this.couponRepo.findOne({
      code: code.toLowerCase(),
    });

    if (couponExist) {
      throw new ConflictException('Coupon already exists');
    }

    const coupon = await this.couponRepo.create({
      code,
      amount,
      fromDate,
      toDate,
      createdBy: user._id,
    });

    if (!coupon) {
      throw new InternalServerErrorException('Failed to create coupon');
    }

    return coupon;
  }

  async updateCoupon(
    id: Types.ObjectId,
    couponDto: updateCouponDto,
    user: HUserDocument,
  ) {
    const coupon = await this.couponRepo.findOne({ filter: { _id: id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (couponDto.code) {
      const codeExist = await this.couponRepo.findOne({
        filter: {
          code: couponDto.code.toLowerCase(),
          _id: { $ne: id },
        },
      });

      if (codeExist) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    const updatedCoupon = await this.couponRepo.findOneAndUpdate(
      { _id: id },
      {
        ...couponDto,
        updatedBy: user._id,
      },
    );

    if (!updatedCoupon) {
      throw new InternalServerErrorException('Failed to update coupon');
    }

    return updatedCoupon;
  }
}
