/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IdsMongo', async: false })
export class IdsMongo implements ValidatorConstraintInterface {
  validate(ids: string[], args: ValidationArguments) {
    return ids.filter((id) => Types.ObjectId.isValid(id)).length === ids.length;
  }

  defaultMessage(args: ValidationArguments) {
    return `id is not valid`;
  }
}
