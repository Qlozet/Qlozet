import React from 'react';

interface ProgressBarProps {
  step: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step }) => {
  const getWidthForStep = (stepNumber: number): string => {
    const widthMap: Record<number, string> = {
      1: '20%',
      2: '40%',
      3: '60%',
      4: '80%',
      5: '95%',
    };
    return widthMap[stepNumber] || '0%';
  };

  return (
    <>
      <div className='h-[7px] w-full bg-gray-300 rounded-[8px] relative'>
        {step >= 1 && step <= 5 && (
          <span
            className='h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]'
            style={{ width: getWidthForStep(step) }}
          ></span>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
