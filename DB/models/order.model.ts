/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/common/enums';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
  cart: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  coupon: Types.ObjectId;

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, enum: PaymentMethodEnum, required: true })
  paymentMethod: string;

  @Prop({ type: String, enum: OrderStatusEnum, required: true })
  status: string;

  @Prop({ type: Date, default: Date.now() + 3 * 24 * 60 * 60 * 1000 })
  arriveAt: Date;

  @Prop({ type: String })
  paymentIntent: string;

  @Prop({
    type: {
      paidAt: Date,
      deliveredAt: Date,
      deliveredBy: { type: Types.ObjectId, ref: 'User' },
      cancelledAt: Date,
      cancelledBy: { type: Types.ObjectId, ref: 'User' },
      refundedAt: Date,
      refundedBy: { type: Types.ObjectId, ref: 'User' },
    },
  })
  orderChanges: object;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export type HOrderDocument = HydratedDocument<Order>;

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
