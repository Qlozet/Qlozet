import { z } from 'zod';

export const businessSchema = z.object({
  businessName: z.string({}).min(1, { message: 'First Name is required' }),
  businessEmail: z.string().email(),
  phoneNumber: z.string().min(1, { message: `Phone Number is required` }),
  businessAddress: z.string(),
});
