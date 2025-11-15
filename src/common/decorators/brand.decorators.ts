/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOne(
  RequiredFields: string[],
  ValidationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: '',
      options: ValidationOptions,
      constraints: RequiredFields,
      validator: {
        validate(value: string, args: ValidationArguments) {
          return RequiredFields.some((field) => args.object[field]);
        },

        defaultMessage(args: ValidationArguments) {
          return `At least one of the required fields ${RequiredFields.join(' , ')} is missing`;
        },
      },
    });
  };
}
