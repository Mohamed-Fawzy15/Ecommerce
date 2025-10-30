import { MongooseModule } from '@nestjs/mongoose';
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserGender, UserProvider, UserRole } from 'src/common/enums';
import type { HOtpDocument } from './otp.model';
import { Hash } from 'src/common/hash';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxlength: 20,
    trim: true,
  })
  fName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  })
  lName: string;

  @Virtual({
    get() {
      return `${this.fName} ${this.lName}`;
    },
    set(v) {
      this.fName = v.split(' ')[0];
      this.lName = v.split(' ')[1];
    },
  })
  userName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  password: string;

  @Prop({ type: Number, min: 18, max: 60, required: true })
  age: number;

  @Prop({ type: Boolean })
  confirmed: boolean;

  @Prop({ type: String, enum: UserRole, default: UserRole.user })
  role: UserRole;

  @Prop({ type: String, enum: UserGender, default: UserGender.male })
  gender: UserGender;

  @Prop({ type: String, enum: UserProvider, default: UserProvider.local })
  provider: UserProvider;

  @Prop({ type: Date, default: Date.now })
  changeCredentialAt: Date;

  @Virtual()
  otp: HOtpDocument;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type HUserDocument = HydratedDocument<User>;

// Add virtual relationship
UserSchema.virtual('otp', {
  ref: 'Otp',
  localField: '_id',
  foreignField: 'createdBy',
});

// Add pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await Hash(this.password);
  }
  next();
});

// Export the model configuration
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
