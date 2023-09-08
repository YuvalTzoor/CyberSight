import Joi from 'joi';
import { JoiPasswordExtend, joiPasswordExtendCore } from 'joi-password';

const joiPassword: JoiPasswordExtend = Joi.extend(joiPasswordExtendCore);

const options: Joi.ValidationOptions = { abortEarly: false };
export const passwordSchema = joiPassword
  .string()
  .min(7)
  .minOfSpecialCharacters(1)
  .minOfLowercase(1)
  .minOfUppercase(1)
  .minOfNumeric(1)
  .noWhiteSpaces()
  .label('Password')
  .options(options);

export const firstNameSchema = Joi.string().min(2).max(32).required().label('First name').options(options);
export const lastNameSchema = Joi.string().min(2).max(32).required().label('Last name').options(options);
export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .label('Email')
  .options(options);

export type Schema = Joi.Schema;
