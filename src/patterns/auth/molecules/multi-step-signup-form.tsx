'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { SignupStepBusiness, BusinessInfoData } from './signup-step-business';
import { SignupStepPersonal, PersonalInfoData } from './signup-step-personal';
import { SignupStepPassword, PasswordInfoData } from './signup-step-password';
import { SignupStepDocuments, DocumentsData } from './signup-step-documents';
import { StepNavigation } from './step-navigation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const signupSchema = z
  .object({
    // Business Information
    businessName: z.string().min(1, 'Business name is required'),
    businessEmail: z.string().email('Please enter a valid email address'),
    businessPhoneNumber: z.string().min(1, 'Business phone number is required'),
    businessAddress: z.string().min(1, 'Business address is required'),

    // Personal Information
    personalName: z.string().min(1, 'Full name is required'),
    phoneName: z.string().min(1, 'Personal phone number is required'),
    nationalIdentityNumber: z
      .string()
      .min(1, 'National Identity Number is required'),
    bankVerificationNumber: z
      .string()
      .min(1, 'Bank Verification Number is required'),

    // Password
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Documents (optional)
    businessLogo: z.any().optional(),
    businessDocuments: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

interface MultiStepSignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  loading?: boolean;
  className?: string;
}

const STEPS = [
  { id: 1, title: 'Business Info', description: 'Business details' },
  { id: 2, title: 'Personal Info', description: 'Your information' },
  { id: 3, title: 'Password', description: 'Account security' },
  { id: 4, title: 'Documents', description: 'Verification files' },
];

export const MultiStepSignupForm: React.FC<MultiStepSignupFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: '',
      businessEmail: '',
      businessPhoneNumber: '',
      businessAddress: '',
      personalName: '',
      phoneName: '',
      nationalIdentityNumber: '',
      bankVerificationNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'businessName',
          'businessEmail',
          'businessPhoneNumber',
          'businessAddress',
        ];
        break;
      case 2:
        fieldsToValidate = [
          'personalName',
          'phoneName',
          'nationalIdentityNumber',
          'bankVerificationNumber',
        ];
        break;
      case 3:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 4:
        // Final step - submit form
        form.handleSubmit(onSubmit)();
        return;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SignupStepBusiness control={form.control} />;
      case 2:
        return <SignupStepPersonal control={form.control} />;
      case 3:
        return <SignupStepPassword control={form.control} />;
      case 4:
        return <SignupStepDocuments control={form.control} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Form {...form}>
      <div className={cn('space-y-8', className)}>
        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <span>{STEPS[currentStep - 1]?.title}</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step Content */}
        <div className='min-h-[400px]'>{renderStep()}</div>

        {/* Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          loading={loading && currentStep === STEPS.length}
          canGoNext={true}
          canGoPrevious={currentStep > 1}
          nextLabel={currentStep === STEPS.length ? 'Create Account' : 'Next'}
        />
      </div>
    </Form>
  );
};
