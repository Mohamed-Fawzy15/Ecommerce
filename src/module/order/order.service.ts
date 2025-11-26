import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CartRepository,
  CouponRepository,
  HUserDocument,
  OrderRepository,
  ProductRepository,
} from 'DB';
import { CreateOrderDto } from './order.dto';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/common/enums';
import { Types } from 'mongoose';
import { StripeService } from 'src/common/service/stripe.service';
import { populate } from 'dotenv';
import path from 'path';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository,
    private readonly couponRepo: CouponRepository,
    private readonly stripeService: StripeService,
  ) {}

  async createOrder(body: CreateOrderDto, user: HUserDocument) {
    const { phone, address, paymentMethod, couponCode } = body;

    let coupon: any;
    if (couponCode) {
      coupon = await this.couponRepo.findOne({
        filter: { code: couponCode, usedBy: { $ne: [user._id] } },
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }
    }

    const cart = await this.cartRepo.findOne({
      filter: { createdBy: user._id },
    });

    if (!cart || cart.products.length === 0) {
      throw new NotFoundException('Cart not found');
    }

    for (const product of cart.products) {
      const productData = await this.productRepo.findOne({
        filter: { _id: product.product, stock: { $gte: product.quantity } },
      });
      if (!productData) {
        throw new NotFoundException('Product not found');
      }
    }

    const order = await this.orderRepo.create({
      userId: user._id,
      cart: cart._id,
      coupon: couponCode ? coupon._id : undefined,
      totalPrice: couponCode
        ? cart.subTotal - cart.subTotal * (coupon.amount / 100)
        : cart.subTotal,
      address,
      phone,
      paymentMethod,
      status:
        paymentMethod == PaymentMethodEnum.CASH
          ? OrderStatusEnum.PLACED
          : OrderStatusEnum.PENDING,
    });

    for (const product of cart.products) {
      await this.productRepo.findOneAndUpdate(
        {
          _id: product.product,
          stock: { $gte: product.quantity },
        },
        {
          $inc: {
            stock: -product.quantity,
          },
        },
      );
    }

    if (coupon) {
      await this.couponRepo.findOneAndUpdate(
        { _id: coupon._id },
        {
          $push: {
            usedBy: user._id,
          },
        },
      );
    }

    if (paymentMethod == PaymentMethodEnum.CASH) {
      await this.cartRepo.findOneAndUpdate(
        { createdBy: user._id },
        {
          $set: {
            products: [],
          },
        },
      );
    }
    return order;
  }

  async paymentWithStripe(id: Types.ObjectId, user: HUserDocument) {
    const order = await this.orderRepo.findOne({
      filter: { _id: id, status: OrderStatusEnum.PENDING },
      options: {
        populate: [
          {
            path: 'cart',
            populate: [
              {
                path: 'products.product',
              },
            ],
          },
          {
            path: 'coupon',
          },
        ],
      },
    });
    if (!order || order.cart['products'].length === 0) {
      throw new NotFoundException('Order not found');
    }
    let coupon: any;
    if (order.coupon) {
      coupon = await this.stripeService.createCoupon({
        percent_off: (order.coupon as any).amount,
        duration: 'once',
      });
    }
    const session = await this.stripeService.createCheckoutSession({
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      discounts: coupon ? [{ coupon: coupon.id }] : [],
      line_items: order.cart['products'].map((product) => {
        return {
          price_data: {
            currency: 'EGP',
            product_data: {
              name: product.product.name,
            },
            unit_amount: product.product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
    });
    return session;
  }

  async webhook(body: any) {
    const orderId = body.data.object.metadata.orderId;
    const order = await this.orderRepo.findOneAndUpdate(
      { _id: orderId },
      {
        status: OrderStatusEnum.PAID,
        orderChanges: {
          paidAt: new Date(),
        },
        paymentIntent: body.data.object.payment_intent,
      },
    );
    return order;
  }

  async refundedOrders(id: Types.ObjectId, user: HUserDocument) {
    const order = await this.orderRepo.findOneAndUpdate(
      {
        _id: id,
        status: { $in: [OrderStatusEnum.PLACED, OrderStatusEnum.PENDING] },
      },
      {
        status: OrderStatusEnum.CANCELLED,
        orderChanges: {
          cancelledAt: new Date(),
          cancelledBy: user._id,
        },
      },
    );
    if (!order) {
      throw new BadGatewayException('order not found');
    }

    if (order.paymentMethod == PaymentMethodEnum.CARD) {
      await this.stripeService.createRefundPayment({
        payment_intent: order.paymentIntent,
        reason: 'requested_by_customer',
      });
      await this.orderRepo.findOneAndUpdate(
        {
          _id: id,
          status: { $in: [OrderStatusEnum.PLACED, OrderStatusEnum.PENDING] },
        },
        {
          status: OrderStatusEnum.REFUNDED,
          orderChanges: {
            refundedAt: new Date(),
            refundedBy: user._id,
          },
        },
      );
    }
    return order;
  }
}
