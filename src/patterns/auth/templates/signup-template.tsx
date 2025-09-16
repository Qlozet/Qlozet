"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import { MultiStepSignupForm, SignupFormData } from '../molecules/multi-step-signup-form';
import { useRegisterMutation } from '@/redux/services/auth/auth.api-slice';
import { useDispatch } from 'react-redux';
// import { setEmail } from '@/redux/slices/filter-slice'; // Assuming email is stored here
import toast from 'react-hot-toast';
import Toast from '@/components/ToastComponent/toast';

interface SignupTemplateProps {
  className?: string;
}

export const SignupTemplate: React.FC<SignupTemplateProps> = ({
  className = '',
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleSignup = async (data: SignupFormData) => {
    try {
      // Transform data to match API expectations
      const requestData = {
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhoneNumber: data.businessPhoneNumber,
        businessAddress: data.businessAddress,
        personalName: data.personalName,
        phoneName: data.phoneName,
        nationalIdentityNumber: data.nationalIdentityNumber,
        bankVerificationNumber: data.bankVerificationNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
        agreeToTerms: true,
      };

      const response = await register(requestData).unwrap();

      if (response) {
        // Store email for verification step if needed
        // dispatch(setEmail(data.businessEmail));
        
        toast(<Toast text="Account created successfully! Please check your email for verification." type="success" />);
        router.push('/auth/verification');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to create account. Please try again.';
      toast(<Toast text={errorMessage} type="danger" />);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Create your business account"
      className={className}
      showImage={false} // Hide image for multi-step form to save space
    >
      <MultiStepSignupForm 
        onSubmit={handleSignup}
        loading={isLoading}
      />
    </AuthLayout>
  );
};