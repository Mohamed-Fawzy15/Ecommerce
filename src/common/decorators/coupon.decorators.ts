/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchFields', async: false })
export class CouponValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    const fromDate = new Date(obj.fromDate);
    const toDate = new Date(obj.toDate);
    const now = new Date();
    return fromDate >= now && fromDate <= toDate;
  }

  defaultMessage(args: ValidationArguments) {
    return `from Date must ne greater than or equal to now and less than to Date`;
  }
}
