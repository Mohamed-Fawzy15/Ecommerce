/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class CartProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  finalPrice: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Cart {
  @Prop({ type: [CartProduct] })
  products: CartProduct[];

  @Prop({ type: Number })
  subTotal: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: Date })
  restoredAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

export type HCartDocument = HydratedDocument<Cart>;
CartSchema.pre('save', async function (next) {
  this.subTotal = this.products.reduce(
    (total, product) => total + product.quantity * product.finalPrice,
    0,
  );
  next();
});
CartSchema.pre(['findOne', 'find', 'findOneAndUpdate'], async function (next) {
  const { paranoid, ...rest } = this.getQuery();
  if (paranoid === false) {
    this.setQuery({ ...rest, deletedAt: { $exists: true } });
  } else {
    this.setQuery({ ...rest, deletedAt: { $exists: false } });
  }

  next();
});

export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);
