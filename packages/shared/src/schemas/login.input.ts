// MM-011 — login input shared between mobile (form validation) and api (DTO).

import { z } from 'zod';

export const loginInputSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
