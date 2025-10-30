import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { HOtpDocument, Otp } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpRepository extends DbRepository<HOtpDocument> {
  constructor(
    @InjectModel(Otp.name)
    protected override readonly model: Model<HOtpDocument>,
  ) {
    super(model);
  }
}
