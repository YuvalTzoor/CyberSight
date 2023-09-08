import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Schema, emailSchema, firstNameSchema, lastNameSchema, passwordSchema } from '@final-project/shared';

export const firstNameValidator = (control: AbstractControl) => schemaValidation(firstNameSchema, control);
export const lastNameValidator = (control: AbstractControl) => schemaValidation(lastNameSchema, control);
export const emailValidator = (control: AbstractControl) => schemaValidation(emailSchema, control);
export const passwordValidator = (control: AbstractControl) => schemaValidation(passwordSchema, control);
export const newPasswordValidator = (control: AbstractControl) =>
  schemaValidation(passwordSchema.label('New Password'), control);

const schemaValidation = (schema: Schema, control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  const { error } = schema.validate(value, { abortEarly: false });
  if (error) {
    const errorObj = error.details.reduce((acc, current) => {
      const key = current.type;
      Object.assign(acc, { [key]: current.message });
      return acc;
    }, {});

    Object.keys(errorObj).forEach((key) => {
      control.setErrors({ [key]: errorObj[key as keyof object] });
    });
    return errorObj;
  } else {
    return null;
  }
};
