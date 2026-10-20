import { z } from 'zod';

const minLengthErrorMessage = 'Password must be at least 6 characters';
const maxLengthErrorMessage = 'Password must not exceed 20 characters';
const uppercaseErrorMessage =
  'Password must contain at least one uppercase letter';
const lowercaseErrorMessage =
  'Password must contain at least one lowercase letter';
const numberErrorMessage = 'Password must contain at least one number';
const specialCharacterErrorMessage =
  'Password must contain at least one special character (!@#$%^&*)';

const passwordSchema = z
  .string()
  .min(6, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage })
  .refine((password) => /[A-Z]/.test(password), {
    message: uppercaseErrorMessage,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: lowercaseErrorMessage,
  })
  .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: specialCharacterErrorMessage,
  });

const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email format' });

const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-[\s]?[0-9])+$/;
const phoneSchema = z
  .string()
  .min(1, { message: 'Phone number is required' })
  .regex(phoneRegex, { message: 'Invalid phone number format' })
  .min(10, { message: 'Phone number must be at least 10 digits' })
  .max(15, { message: 'Phone number must not exceed 15 digits' });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
