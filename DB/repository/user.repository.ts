import { Model } from 'mongoose';
import { DbRepository } from './db.repository';
import { HUserDocument, User } from 'DB/models';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends DbRepository<HUserDocument> {
  constructor(
    @InjectModel(User.name)
    protected override readonly model: Model<HUserDocument>,
  ) {
    super(model);
  }
}
