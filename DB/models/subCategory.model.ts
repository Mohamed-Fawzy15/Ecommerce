/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MongooseModule, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';

export class SubCategory {
  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 50,
    trim: true,
    unique: true,
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
    maxlength: 10,
    trim: true,
  })
  slogan: string;

  @Prop({ required: true, type: String })
  image: string;

  @Prop({ type: String })
  assetFolderID: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: Date })
  restoredAt: Date;

  @Prop([{ type: Types.ObjectId, ref: 'Brand' }])
  brands: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

export type HSubCategoryDocument = HydratedDocument<SubCategory>;
SubCategorySchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate as UpdateQuery<SubCategory>;
  if (update.name) {
    update.slug = slugify(update.name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
  }
  next();
});
SubCategorySchema.pre(
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

export const SubCategoryModel = MongooseModule.forFeature([
  { name: SubCategory.name, schema: SubCategorySchema },
]);
