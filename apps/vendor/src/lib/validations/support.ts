// Support Validation Schema
// Zod validation schema for support form

import { z } from 'zod';

export const supportSchema = z.object({
  issueType: z.string().min(1, 'Issue type is required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters long'),
});

export type SupportData = z.infer<typeof supportSchema>;
