import React from "react";

const Button = ({
  variant,
  children,
  btnSize,
  disabled,
  clickHandler,
  maxWidth,
  minWidth,
  loading,
  className,
  ...rest
}) => {
  let variantClasses = "";
  let sizeClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = `font-light hover:bg-primary-100 text-white font-bold py-3 px-4  ${
        disabled ? "bg-primary-100 cursor-not-allowed" : "bg-primary"
      }`;
      break;
    case "outline":
      variantClasses = `hover:border-[1px] hover:border-primary  font-light hover:bg-gray-400 text-gray-800 font-bold  py-3 px-4 border-[1px] border-solid border-[rgba(18, 18, 18, 1)] ${
        disabled ? "bg-white-100 cursor-not-allowed" : "bg-white"
      }`;
      break;
    case "danger":
      variantClasses = `font-light text-white font-bold  py-3 px-4 border-[1px] border-solid border-[rgba(18, 18, 18, 1)] ${
        disabled ? "bg-white-100 cursor-not-allowed" : "bg-[#FF3A3A]"
      }`;
      break;
    default:
      variantClasses = `font-light bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 `;
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
      className={`py-2  flex items-center justify-center gap-4 rounded-[5px] ${minWidth} ${maxWidth} ${variantClasses} ${sizeClasses} text-[14px] ${className} ${
        loading && "cursor-not-allowed"
      }`}
      {...rest}
      disabled={loading ? true : false}
      onClick={clickHandler}
    >
      {!loading ? children : "Loading..."}
    </button>
  );
};

export default Button;
