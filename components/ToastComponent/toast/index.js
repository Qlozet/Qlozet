import errorIcon from "../../../public/assets/svg/toast-error-icon.svg";
import successIcon from "../../../public/assets/svg/toast-success-icon.svg";
import warningIcon from "../../../public/assets/svg/toast-warning-icon.svg";
import notification from "../../../public/assets/svg/toast-notification-icon.svg";
import Image from "next/image";

const Toast = ({ type, text }) => {
  return (
    <div className="rounded-[12px] bg-white">
      <div
        className={`lg:min-w-[312px] h-full text-center
   px-4 py-3 flex items-center justify-start text-sm font-[400]  shadow
   ${type === "danger" && " text-[#FF3A3A]  bg-[#FFF5F5]  border-[#FFAAAA] "}
   ${type === "success" && " text-[#33CC33]  bg-success-300  border-[#33CC33] "}
   ${type === "warning" && " text-[#FFB020]  bg-[#FFF7DE]  border-[#FFDD77] "}
   ${type === "notify" && " text-dark  bg-[#fff]  border-[#ACB5BD] "}

   border-[1px] border-solid rounded-[12px] gap-6`}
      >
        {type === "danger" && <Image src={errorIcon} alt="" />}
        {type === "success" && <Image src={successIcon} alt="" />}
        {type === "warning" && <Image src={warningIcon} alt="" />}
        {type === "notify" && <Image src={notification} alt="" />}

        {text}
      </div>
    </div>
  );
};

export default Toast;
