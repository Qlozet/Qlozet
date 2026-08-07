// The auth forms are the first thing a vendor touches, and every rule here is
// enforced only on the client — a loosened regex or a dropped refine ships as a
// broken sign-up with no other signal.

import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  deleteAccountSchema,
  disableTwoFactorSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  signInSchema,
  twoFactorSetupSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from '../auth';

const GOOD_PASSWORD = 'Passw0rd!';

const errorFor = (result: { success: boolean; error?: unknown }, path: string) => {
  if (result.success) return undefined;
  const issues = (result.error as { issues: { path: (string | number)[]; message: string }[] })
    .issues;
  return issues.find((i) => i.path.join('.') === path)?.message;
};

describe('signInSchema', () => {
  it('accepts an email and any non-empty password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('lower-cases the email so casing never splits an account', () => {
    const result = signInSchema.safeParse({ email: 'ADA@B.CO', password: 'x' });
    expect(result.success && result.data.email).toBe('ada@b.co');
  });

  it('rejects a malformed email and a blank password', () => {
    expect(signInSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
    expect(signInSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Ada Obi',
    email: 'ada@b.co',
    password: GOOD_PASSWORD,
    confirmPassword: GOOD_PASSWORD,
    phone: '+2348012345673',
    businessName: 'Qlozet',
    businessType: 'tailor',
    agreeToTerms: true,
  };

  it('accepts a complete, valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts empty optional business fields and phone', () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        phone: '',
        businessName: '',
        businessType: '',
      }).success
    ).toBe(true);
  });

  it('requires the password to carry all four character classes', () => {
    const weak = ['password', 'PASSWORD1!', 'Password!', 'Password1', 'Pa1!'];
    for (const password of weak) {
      expect(
        registerSchema.safeParse({ ...valid, password, confirmPassword: password }).success
      ).toBe(false);
    }
  });

  it('reports a password mismatch against the confirm field', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'Different1!',
    });
    expect(errorFor(result, 'confirmPassword')).toBe('Passwords do not match');
  });

  it('rejects a name containing digits or symbols', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'Ada2' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    // Dots and hyphens are legitimate in names.
    expect(registerSchema.safeParse({ ...valid, name: "St. Ada-Obi" }).success).toBe(true);
  });

  it('rejects a malformed phone number', () => {
    expect(registerSchema.safeParse({ ...valid, phone: '0801-234' }).success).toBe(false);
  });

  it('requires the terms checkbox', () => {
    const result = registerSchema.safeParse({ ...valid, agreeToTerms: false });
    expect(errorFor(result, 'agreeToTerms')).toMatch(/terms/i);
  });
});

describe('password reset + change', () => {
  it('requires a token on reset', () => {
    expect(
      resetPasswordSchema.safeParse({
        token: '',
        password: GOOD_PASSWORD,
        confirmPassword: GOOD_PASSWORD,
      }).success
    ).toBe(false);
  });

  it('accepts a valid reset', () => {
    expect(
      resetPasswordSchema.safeParse({
        token: 't',
        password: GOOD_PASSWORD,
        confirmPassword: GOOD_PASSWORD,
      }).success
    ).toBe(true);
  });

  it('rejects reusing the current password on change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: GOOD_PASSWORD,
      newPassword: GOOD_PASSWORD,
      confirmPassword: GOOD_PASSWORD,
    });
    expect(errorFor(result, 'newPassword')).toMatch(/different/i);
  });

  it('accepts a genuinely new password', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Old0rd!x',
        newPassword: GOOD_PASSWORD,
        confirmPassword: GOOD_PASSWORD,
      }).success
    ).toBe(true);
  });
});

describe('small auth schemas', () => {
  it('validates forgot-password and verify-email payloads', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ token: 't' }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ token: '' }).success).toBe(false);
  });

  it('requires a six-digit 2FA code', () => {
    expect(twoFactorSetupSchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(twoFactorSetupSchema.safeParse({ code: '12345' }).success).toBe(false);
    expect(twoFactorSetupSchema.safeParse({ code: '1234567' }).success).toBe(false);
    expect(twoFactorSetupSchema.safeParse({ code: '12345a' }).success).toBe(false);
    expect(disableTwoFactorSchema.safeParse({ password: 'x' }).success).toBe(true);
  });

  // Typing the exact word is the only guard on an irreversible action.
  it('requires the literal word DELETE to close an account', () => {
    expect(
      deleteAccountSchema.safeParse({ password: 'x', confirmation: 'DELETE' }).success
    ).toBe(true);
    for (const confirmation of ['delete', 'Delete', 'DELET', 'yes']) {
      expect(deleteAccountSchema.safeParse({ password: 'x', confirmation }).success).toBe(
        false
      );
    }
  });

  it('lets a profile update omit every field', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });
});
