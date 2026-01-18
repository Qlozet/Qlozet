import React from 'react';

interface TimeInputProps {
  label?: string;
  setValue: (value: string) => void;
  value: string | number;
  error?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  setValue,
  value,
  error,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className='my-3 relative'>
      {leftIcon}
      <label className='text-sm font-light my-2 text-dark'> {label}</label>
      <input
        type='number'
        className={`py-3 ${
          error && 'border-danger'
        } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
            focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${
              disabled && 'border-0 bg-gray-300 cursor-not-allowed'
            } `}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      ></input>
      {rightIcon}
      {error && (
        <p className='text-danger text-xs font-[400]'>
          {label} cannot be empty!
        </p>
      )}
    </div>
  );
};

export default TimeInput;
