// Authentication Validation Schemas - Zod
// Validation schemas for authentication-related forms and data

import { z } from 'zod';

// Password Schema (reusable)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// Email Schema (reusable)
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email is too long')
  .toLowerCase();

// Name Schema (reusable)
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(
    /^[a-zA-Z\s.-]+$/,
    'Name can only contain letters, spaces, dots, and hyphens'
  );

// Phone Schema (reusable)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

// Register Schema
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: phoneSchema,
    businessName: z
      .string()
      .max(200, 'Business name is too long')
      .optional()
      .or(z.literal('')),
    businessType: z
      .string()
      .max(100, 'Business type is too long')
      .optional()
      .or(z.literal('')),
    agreeToTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must agree to the terms and conditions'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema,
  businessName: z
    .string()
    .max(200, 'Business name is too long')
    .optional()
    .or(z.literal('')),
  businessType: z
    .string()
    .max(100, 'Business type is too long')
    .optional()
    .or(z.literal('')),
});

// Verify Email Schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Resend Verification Email Schema
export const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});

// Two-Factor Authentication Schemas
export const twoFactorSetupSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// Delete Account Schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z
    .string()
    .min(1, 'Please type "DELETE" to confirm')
    .refine(
      (val) => val === 'DELETE',
      'Please type "DELETE" to confirm account deletion'
    ),
});

// Profile Image Upload Schema
export const profileImageSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Image size must be less than 5MB'
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
          file.type
        ),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});

// Push Notification Subscription Schema
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
  }),
});

// Login with Two-Factor Schema
export const loginTwoFactorSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
  rememberMe: z.boolean().default(false),
});

// Email Change Schema
export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Account Recovery Schema
export const accountRecoverySchema = z
  .object({
    recoveryCode: z
      .string()
      .min(1, 'Recovery code is required')
      .max(100, 'Recovery code is too long'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Type exports
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailData = z.infer<
  typeof resendVerificationEmailSchema
>;
export type TwoFactorSetupData = z.infer<typeof twoFactorSetupSchema>;
export type DisableTwoFactorData = z.infer<typeof disableTwoFactorSchema>;
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>;
export type ProfileImageData = z.infer<typeof profileImageSchema>;
export type PushSubscriptionData = z.infer<typeof pushSubscriptionSchema>;
export type LoginTwoFactorData = z.infer<typeof loginTwoFactorSchema>;
export type ChangeEmailData = z.infer<typeof changeEmailSchema>;
export type AccountRecoveryData = z.infer<typeof accountRecoverySchema>;

// Default values
export const createDefaultLoginData = (): LoginData => ({
  email: '',
  password: '',
  rememberMe: false,
});

export const createDefaultRegisterData = (): RegisterData => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  businessName: '',
  businessType: '',
  agreeToTerms: false,
});

export const createDefaultProfileData = (): UpdateProfileData => ({
  name: '',
  phone: '',
  businessName: '',
  businessType: '',
});

export const createDefaultChangePasswordData = (): ChangePasswordData => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Validation helpers
export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const getPasswordStrength = (
  password: string
): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else if (password.length >= 8)
    feedback.push('Consider using 12 or more characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Include special characters (@$!%*?&)');

  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeating characters');

  return { score: Math.min(score, 5), feedback };
};

// Email domain validation
export const validateEmailDomain = async (email: string): Promise<boolean> => {
  // This would typically make an API call to validate the domain
  // For now, just check if it's a valid email format
  return validateEmail(email);
};

// Password complexity check
export const checkPasswordComplexity = (
  password: string
): {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
} => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid:
      hasMinLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar,
  };
};
