import React from 'react';

interface EmailInputProps {
  label: string;
  error?: boolean;
  setValue: (value: string) => void;
  value: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({
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
    <div className="my-3">
      {leftIcon}
      <label className="text-sm font-light my-2 text-dark"> {label}</label>
      <input
        type="email"
        className={`py-3 px-4 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${error && "border-danger"}
          border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed"}
        `}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
      />
      {rightIcon}
      {error && (
        <p className="text-danger text-xs font-[400]">
          {label} cannot be empty!
        </p>
      )}
    </div>
  );
};

export default EmailInput;