import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, HUserDocument } from '../models/user.model';
import { DbRepository } from './db.repository';

@Injectable()
export class UserRepository extends DbRepository<HUserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<HUserDocument>) {
    super(userModel);
  }
}
