/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types, HydratedDocument } from 'mongoose';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OtpTypeEnum } from 'src/common/enums';
import { eventEmitter } from 'src/common/service';
import { Hash } from 'src/common/hash';

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, type: String, trim: true })
  code: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ required: true, type: String, enum: OtpTypeEnum })
  type: OtpTypeEnum;

  @Prop({ required: true, type: Date })
  expireAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(Otp);

export type HOtpDocument = HydratedDocument<Otp>;

OtpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.pre(
  'save',
  async function (
    this: HOtpDocument & { is_new: boolean; plainCode: string },
    next,
  ) {
    if (this.isModified('code')) {
      this.plainCode = this.code;
      this.is_new = this.isNew;
      this.code = await Hash(this.code);
      await this.populate([
        {
          path: 'createdBy',
          select: 'email',
        },
      ]);
    }

    next();
  },
);

// eslint-disable-next-line @typescript-eslint/require-await
OtpSchema.post('save', async function (doc, next) {
  const that = this as HOtpDocument & { is_new: boolean; plainCode: string };
  if (that.is_new) {
    eventEmitter.emit(doc.type, {
      otp: that.plainCode,
      email: (doc.createdBy as any).email,
    });
  }

  next();
});

export const OtpModel = MongooseModule.forFeature([
  { name: Otp.name, schema: OtpSchema },
]);
