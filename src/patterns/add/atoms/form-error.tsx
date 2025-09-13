// Form Error - Atom
// Displays form validation error messages

import React from "react";

interface FormErrorProps {
  error?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className = "" }) => {
  if (!error) return null;
  
  return (
    <p className={`text-sm font-medium text-red-600 mt-1 ${className}`}>
      {error}
    </p>
  );
};