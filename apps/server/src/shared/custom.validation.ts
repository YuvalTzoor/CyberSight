import { emailSchema, firstNameSchema, lastNameSchema, passwordSchema } from '@final-project/shared';
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export function IsValidFirstName(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    let errors: string | undefined;

    registerDecorator({
      name: 'IsValidFirstName',
      target: object.constructor,
      propertyName,
      options: {
        message(validationArguments) {
          return errors || validationOptions?.message.toString();
        },
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { error } = firstNameSchema.validate(value);
          if (error) {
            errors = error.details.map((detail) => detail.message).join(', ');
          }
          return error === undefined;
        },
      },
    });
  };
}
export function IsValidLastName(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    let errors: string | undefined;

    registerDecorator({
      name: 'IsValidLastName',
      target: object.constructor,
      propertyName,
      options: {
        message(validationArguments) {
          return errors || validationOptions?.message.toString();
        },
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { error } = lastNameSchema.validate(value);
          if (error) {
            errors = error.details.map((detail) => detail.message).join(', ');
          }
          return error === undefined;
        },
      },
    });
  };
}
export function IsValidEmail(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    let errors: string | undefined;

    registerDecorator({
      name: 'IsValidEmail',
      target: object.constructor,
      propertyName,
      options: {
        message(validationArguments) {
          return errors || validationOptions?.message.toString();
        },
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { error } = emailSchema.validate(value);
          if (error) {
            errors = error.details.map((detail) => detail.message).join(', ');
          }
          return error === undefined;
        },
      },
    });
  };
}
export function IsValidPassword(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    let errors: string | undefined;

    registerDecorator({
      name: 'IsValidPassword',
      target: object.constructor,
      propertyName,
      options: {
        message(validationArguments) {
          return errors || validationOptions?.message.toString();
        },
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { error } = passwordSchema.validate(value);
          if (error) {
            errors = error.details.map((detail) => detail.message).join(', ');
          }
          return error === undefined;
        },
      },
    });
  };
}

export function IsValidNewPassword(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    let errors: string | undefined;

    registerDecorator({
      name: 'IsValidNewPassword',
      target: object.constructor,
      propertyName,
      options: {
        message(validationArguments) {
          return errors || validationOptions?.message.toString();
        },
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          passwordSchema.label('New Password');
          const { error } = passwordSchema.validate(value);
          if (error) {
            errors = error.details.map((detail) => detail.message).join(', ');
          }
          return error === undefined;
        },
      },
    });
  };
}

export function IsNotMatch(property: string, validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsNotMatch',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          return value !== relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} and ${relatedPropertyName} must not match!`;
        },
      },
    });
  };
}
