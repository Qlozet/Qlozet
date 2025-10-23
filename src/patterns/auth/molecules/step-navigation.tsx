'use client';

import React from 'react';
import { SubmitButton } from '@/patterns/common/molecules/submit-button';
import { ChevronLeft } from 'lucide-react';
import Button from '@/components/Button';

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
    <div className={`flex items-center justify-between ${canGoPrevious ? "gap-x-3.5" : ""} ${className}`}>
      {/* Previous Button */}
      {!isFirstStep && canGoPrevious ? (
        <Button
          variant='outline'
          onClick={onPrevious}
          className='h-10 lg:[50px] flex items-center gap-2'
        >
          <ChevronLeft />
          {previousLabel}
        </Button>
      ) : (
        <div></div>
      )}

      {/* Step Indicator */}
      {/* <div className='flex items-center space-x-2'>
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`
              w-3 h-3 rounded-full transition-colors
              ${index + 1 <= currentStep ? 'bg-primary' : 'bg-gray-300'}
            `}
          />
        ))}
      </div> */}

      {/* Next Button */}
      <SubmitButton
        variant='default'
        onClick={onNext}
        loading={loading}
        disabled={!canGoNext || loading}
        className='w-full h-10 lg:[50px] flex-1'
      >
        {isLastStep ? 'Complete' : nextLabel}
      </SubmitButton>
    </div>
  );
};
