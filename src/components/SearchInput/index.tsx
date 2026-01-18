import React from 'react';
import Image from 'next/image';
import searchIcon from '@/public/assets/svg/search-normal-gray.svg';

interface SearchInputProps {
  label?: string;
  error?: boolean;
  setValue: (value: string) => void;
  value: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  error,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className='block w-full'>
      <div className='my-3 relative'>
        <Image
          src={searchIcon}
          className='absolute top-[0.6rem] left-2.5'
          alt='Search'
        />
        {label && (
          <label className='text-sm font-light my-2 text-dark'>{label}</label>
        )}
        <input
          type='text'
          className={`py-2 pl-10 pr-4 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
            focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${error && 'border-danger'}
            border-gray-2 rounded-[12px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && 'border-0 bg-gray-300 cursor-not-allowed'}
          `}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
        />
        {rightIcon}
        {error && (
          <p className='text-danger text-xs font-[400]'>
            {label || 'Search'} cannot be empty!
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
