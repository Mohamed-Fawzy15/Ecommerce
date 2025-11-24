import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';
import { createCouponDto, idDto, updateCouponDto } from './coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Post()
  async createCoupon(
    @Body() couponDto: createCouponDto,
    @User() user: HUserDocument,
  ) {
    const coupon = this.couponService.createCoupon(couponDto, user);
    return { message: 'done', coupon };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch(':id')
  async updateCoupon(
    @Param() param: idDto,
    @Body() couponDto: updateCouponDto,
    @User() user: HUserDocument,
  ) {
    const coupon = await this.couponService.updateCoupon(
      param.id,
      couponDto,
      user,
    );
    return { message: 'coupon updated successfully', coupon };
  }
}
