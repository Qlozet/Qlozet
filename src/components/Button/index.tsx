import React from 'react';
import { motion } from 'framer-motion';

// Define the props interface for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'outline' | 'danger';
  children: React.ReactNode;
  btnSize?: 'large' | 'small';
  disabled?: boolean;
  clickHandler?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  maxWidth?: string;
  minWidth?: string;
  loading?: boolean;
  className?: string;
  paddingVertical?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  children,
  btnSize,
  disabled,
  clickHandler,
  maxWidth,
  minWidth,
  loading,
  className,
  paddingVertical,
  ...rest
}) => {
  let variantClasses = '';
  let sizeClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = `font-light  text-white font-bold  px-4  ${
        disabled ? 'bg-primary-100 cursor-not-allowed' : 'bg-primary'
      }`;
      break;
    case 'outline':
      variantClasses = `hover:border-[1px]   font-light hover:bg-gray-400 text-gray-800 font-bold  px-4 border-[1px] border-solid border-[rgba(18, 18, 18, 1)] ${
        disabled ? 'bg-white-100 cursor-not-allowed' : 'bg-white'
      }`;
      break;
    case 'danger':
      variantClasses = `font-light text-white font-bold  py-3 px-4 border-[1px] border-solid border-[rgba(18, 18, 18, 1)] ${
        disabled ? 'bg-white-100 cursor-not-allowed' : 'bg-[#FF3A3A]'
      }`;
      break;
    default:
      variantClasses = `font-light bg-gray-500  text-white font-bold py-3 px-4 `;
  }

  switch (btnSize) {
    case 'large':
      sizeClasses = 'w-full py-3';
      break;
    case 'small':
      sizeClasses = ' py-2 px-2 lg:px-6';
      break;
    default:
      sizeClasses = 'px-4';
  }

  return (
    <motion.button
      whileHover={{
        scale: 0.98,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className={` ${
        paddingVertical ? paddingVertical : 'py-3'
      } flex items-center justify-center gap-4 rounded-lg ${minWidth} ${maxWidth} ${variantClasses} ${sizeClasses} text-sm  ${
        loading && 'cursor-not-allowed'
      } ${className}`}
      {...rest}
      disabled={loading ? true : disabled}
      onClick={clickHandler}
    >
      {!loading ? children : 'Loading...'}
    </motion.button>
  );
};

export default Button;
