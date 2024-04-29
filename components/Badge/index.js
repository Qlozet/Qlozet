import React from "react";
import Typography from "../Typography";
const Badge = ({ variant, children, ...rest }) => {
  let variantClasses = "";
  let sizeClasses = "";

  switch (variant) {
    case "success":
      variantClasses = `text-success  py-2 px-4  bg-success-300`;
      break;
    case "danger":
      variantClasses = ` text-gray-800    bg-[#FFF5F5] text-danger`;
      break;
    case "warning":
      variantClasses = `text-gray-800    bg-warning-300 text-warning`;
      break;
    default:
      variantClasses = `bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 `;
  }

  return (
    <div
      className={`py-2 flex items-center justify-center ${variantClasses} text-[16px] font-[300] w-[108px] h-[30px] rounded`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Badge;
