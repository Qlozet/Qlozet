"use client";

import React from 'react';
import { AuthLayout } from '../organisms/auth-layout';
import { SignInSection } from '../organisms/sign-in-section';

interface SignInTemplateProps {
  className?: string;
}

export const SignInTemplate: React.FC<SignInTemplateProps> = ({
  className = '',
}) => {

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Please enter your login details below"
      className={className}
    >
      <SignInSection />
    </AuthLayout>
  );
};