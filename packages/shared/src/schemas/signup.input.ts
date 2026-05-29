// MM-012 — signup input shared between mobile (form validation) and api (DTO).
// Password rules per ADR-0001 §1: min 10 chars, ≥1 letter + ≥1 digit.

import { z } from 'zod';

const PASSWORD_LETTER_DIGIT = /(?=.*[A-Za-z])(?=.*\d)/;

export const signupInputSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(10, { message: 'Use at least 10 characters' })
    .regex(PASSWORD_LETTER_DIGIT, {
      message: 'Mix at least one letter and one digit',
    }),
  ageAttested: z.literal(true, {
    errorMap: () => ({ message: 'You must be 18 or older to use Mimir' }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Accept the Terms of Service to continue' }),
  }),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
