"use client";

import React from 'react';
import { AuthButton } from '../atoms/auth-button';
import Image from 'next/image';
import previousIcon from '@/public/assets/svg/previousicon.svg';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  nextLabel?: string;
  previousLabel?: string;
  loading?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  className?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  loading = false,
  canGoNext = true,
  canGoPrevious = true,
  className = '',
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={`flex items-center justify-between mt-8 ${className}`}>
      {/* Previous Button */}
      {!isFirstStep && canGoPrevious ? (
        <AuthButton
          variant="ghost"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <Image src={previousIcon} alt="Previous" width={16} height={16} />
          {previousLabel}
        </AuthButton>
      ) : (
        <div></div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`
              w-3 h-3 rounded-full transition-colors
              ${
                index + 1 <= currentStep
                  ? 'bg-primary'
                  : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>

      {/* Next Button */}
      <AuthButton
        variant="default"
        onClick={onNext}
        loading={loading}
        disabled={!canGoNext}
      >
        {isLastStep ? 'Complete' : nextLabel}
      </AuthButton>
    </div>
  );
};