import React from 'react';

interface RadioInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props here if needed
}

const RadioInput: React.FC<RadioInputProps> = ({ ...rest }) => {
  return (
    <div>
      <input
        className="h-5 w-5 focus:ring-primary-300 focus:ring-offset-0 cursor-pointer p-2 bg-primary-300"
        type="radio"
        {...rest}
      />
    </div>
  );
};

export default RadioInput;