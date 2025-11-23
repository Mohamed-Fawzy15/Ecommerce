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
export class Product {
  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 500,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    default: function () {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;

  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 10000000,
    trim: true,
  })
  description: string;

  @Prop({ required: true, type: String })
  mainImage: string;

  @Prop({ type: [String] })
  subImages: string[];

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number, min: 1, max: 100 })
  discount: number;

  @Prop({ type: Number, min: 1 })
  stock: number;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  rateNum: Number;

  @Prop({ type: Number })
  rateAvg: Number;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubCategory', required: true })
  subCategory: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: Date })
  restoredAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type HProductDocument = HydratedDocument<Product>;
ProductSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate as UpdateQuery<Product>;
  if (update.name) {
    update.slug = slugify(update.name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
  }
  next();
});
ProductSchema.pre(
  ['findOne', 'find', 'findOneAndUpdate'],
  async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false) {
      this.setQuery({ ...rest, deletedAt: { $exists: true } });
    } else {
      this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }

    next();
  },
);

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
