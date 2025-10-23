'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthLayout } from '../organisms/auth-layout';
import {
  MultiStepSignupForm
} from '../molecules/multi-step-signup-form';
import { useRegisterMutation } from '@/redux/services/auth/auth.api-slice';
import { useDispatch } from 'react-redux';
// import { setEmail } from '@/redux/slices/filter-slice'; // Assuming email is stored here
import { toast } from 'sonner';
import { SignupStepBusiness } from '../molecules/signup-step-business';
import { SignupStepPersonal } from '../molecules/signup-step-personal';
import { SignupStepPassword } from '../molecules/signup-step-password';
import { SignupStepDocuments } from '../molecules/signup-step-documents';
import { StepNavigation } from '../molecules/step-navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import useCreateSearchQuery from '@/lib/hooks/useCreateSearchQuery';

const signupSchema = z
  .object({
    // Business Information
    businessName: z.string().min(1, 'Business name is required'),
    businessEmail: z.email('Please enter a valid email address'),
    businessPhoneNumber: z.string().min(1, 'Business phone number is required'),
    businessAddress: z.string().min(1, 'Business address is required'),

    // Personal Information
    personalName: z.string().min(1, 'Full name is required'),
    personalEmail: z.string().email('Please enter a valid email address'),
    phoneName: z.string().min(1, 'Personal phone number is required'),
    nationalIdentityNumber: z
      .string()
      .min(1, 'National Identity Number is required')
      .length(11, 'National Identity Number must be exactly 11 digits')
      .regex(/^\d{11}$/, 'National Identity Number must contain only digits'),
    // bankVerificationNumber: z
    //   .string()
    //   .min(1, 'Bank Verification Number is required'),

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

export const SignupTemplate = () => {
  const { push } = useRouter();
  const dispatch = useDispatch();
  const { searchParams, createSearchParams } = useCreateSearchQuery();

  // Initialize step from URL query parameter or default to 1
  const stepFromUrl = searchParams.get('step');
  const initialStep = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;
  const [currentStep, setCurrentStep] = useState(
    initialStep >= 1 && initialStep <= 4 ? initialStep : 1
  );

  const STEPS = [
    { id: 1, title: 'Business Info', description: 'Business details' },
    { id: 2, title: 'Personal Info', description: 'Your information' },
    { id: 3, title: 'Password', description: 'Account security' },
    { id: 4, title: 'Documents', description: 'Verification files' },
  ];

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // Validate on input change
    reValidateMode: 'onChange', // Re-validate on change after first validation
    defaultValues: {
      businessName: '',
      businessEmail: '',
      businessPhoneNumber: '',
      businessAddress: '',
      personalName: '',
      phoneName: '',
      nationalIdentityNumber: '',
      // bankVerificationNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Sync URL query parameter when step changes
  useEffect(() => {
    createSearchParams({
      param: { name: 'step', value: currentStep.toString() },
      replaceUrl: true,
    });
  }, [currentStep]);

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
          // 'bankVerificationNumber',
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


  // Signup mutation hook
  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = (data: SignupFormData) => {
    // Transform data to match API expectations
    const requestData = {
      business_name: data.businessName,
      business_email: data.businessEmail,
      business_phone_number: data.businessPhoneNumber,
      business_address: data.businessAddress,
      personal_name: data.personalName,
      personal_email: data.personalEmail,
      personal_phone_number: data.phoneName,
      national_identity_number: data.nationalIdentityNumber,
      // bankVerificationNumber: data.bankVerificationNumber,
      password: data.password
    };

    register(requestData)
      .unwrap()
      .then(() => {
        // Store email for verification step if needed
        // dispatch(setEmail(data.businessEmail));

        toast.success('Account created successfully! Please check your email for verification.');
        push(AUTH_ROUTES.awaitingVerification);
      })
      .catch((error: any) => {
        const errorMessage =
          error?.data?.message || 'Failed to create account. Please try again.';
        toast.error(errorMessage);
      })
  }

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
    <AuthLayout
      title='Sign Up'
      subtitle='Please fill in the information below to register as a vendor'
      showImage={true}
    >
      <Form {...form}>
        <div className={cn('w-full lg:min-w-[424px] space-y-8')}>
          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm text-muted-foreground'>
              <span>
                Step {currentStep} of {STEPS.length}
              </span>
              {/* <span>{STEPS[currentStep - 1]?.title}</span> */}
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
            loading={isLoading && currentStep === STEPS.length}
            canGoNext={true}
            canGoPrevious={currentStep > 1}
            nextLabel={currentStep === STEPS.length ? 'Create Account' : 'Next'}
          />
        </div>
      </Form>
    </AuthLayout>
  );
};
