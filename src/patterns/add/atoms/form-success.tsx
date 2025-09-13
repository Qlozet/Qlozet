// Form Success - Atom
// Displays form success messages

import React from "react";

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ message, className = "" }) => {
  if (!message) return null;
  
  return (
    <p className={`text-sm font-medium text-green-600 mt-1 ${className}`}>
      {message}
    </p>
  );
};