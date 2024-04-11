import React from "react";

const Button = ({ variant, children, btnSize, disabled, ...rest }) => {
  let variantClasses = "";
  let sizeClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = `font-light hover:bg-primary-100 text-white font-bold py-3 px-4 rounded ${
        disabled ? "bg-primary-100 cursor-not-allowed" : "bg-primary"
      }`;
      break;
    case "outline":
      variantClasses = `font-light hover:bg-gray-400 text-gray-800 font-bold rounded-[8px] py-3 px-4 border-[1px] border-solid border-[rgba(18, 18, 18, 1)] ${
        disabled ? "bg-white-100 cursor-not-allowed" : "bg-white"
      }`;
      break;
    default:
      variantClasses = `font-light bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-[8px]`;
  }

  switch (btnSize) {
    case "large":
      sizeClasses = "w-full ";
      break;
    case "small":
      sizeClasses = "w-[155px] py-3 px-6";
      break;
    default:
      sizeClasses = "py-2 px-4";
  }

  return (
    <button
      className={`py-2 flex items-center justify-center  ${variantClasses} ${sizeClasses} `}
      {...rest}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
