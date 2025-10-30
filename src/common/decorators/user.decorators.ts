/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchFields', async: false })
export class MatchFields implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return value === args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} do not match ${args.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  ValidationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: ValidationOptions,
      constraints,
      validator: MatchFields,
    });
  };
}
