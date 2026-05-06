import React, { ReactNode } from 'react';
import Typography from '../Typography';

interface QuantityProps {
  label?: string;
  setValue: (value: string | number) => void;
  value: string | number;
  error?: boolean;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const Quantity: React.FC<QuantityProps> = ({
  label,
  setValue,
  value,
  error,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleDecrement = (): void => {
    setValue(-1);
  };

  const handleIncrement = (): void => {
    setValue(+1);
  };

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
        onChange={handleInputChange}
      />
      {rightIcon}
      <div className='flex items-center gap-2 absolute top-[2rem] right-[2rem]'>
        <div className='cursor-pointer' onClick={handleDecrement}>
          <Typography
            textWeight='font-bold'
            textSize='text-sm'
            verticalPadding='my-2'
            textColor='text-gray-200'
          >
            -
          </Typography>
        </div>
        <div className=''>
          <Typography
            textWeight='font-bold'
            textSize='text-sm'
            verticalPadding='my-2'
            textColor='text-gray-200'
          >
            0
          </Typography>
        </div>
        <div className='cursor-pointer' onClick={handleIncrement}>
          <Typography
            textWeight='font-bold'
            textSize='text-sm'
            verticalPadding='my-2'
            textColor='text-gray-200'
          >
            +
          </Typography>
        </div>
      </div>
      {error && (
        <p className='text-danger text-xs font-[400]'>
          {label} cannot be empty!
        </p>
      )}
    </div>
  );
};

export default Quantity;
