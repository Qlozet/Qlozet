import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
import classes from "./index.module.css";
const CustomizeNav = ({
  active,
  data,
  closeModal,
  width,
  full,
  bg,
  navWidth,
}) => {
  return (
    <div
      className={`${width ? width : "w-full md:w-[50%]"} ${
        bg ? bg : "bg-white "
      } py-1 px-5 rounded-t-[12px] `}
    >
      <div className="flex items-center justify-between py-4">
        <Typography
          textColor="text-dark"
          textWeight="font-[600]"
          textSize="text-[14px]"
        >
          Sign Up
        </Typography>
        <div onClick={closeModal} className="cursor-pointer">
          <Image src={closeIcon} alt="" />
        </div>
      </div>
      <div className="border-[1px] border-gray-200 border-dashed"></div>
      <div className="flex justify-between items-center w-full py-4">
        <div
          className={`border-dashed flex items-center justify-between w-full
           `}
        >
          {data.map((item) => (
            <div
              className={`${
                active === item.item
                  ? "border-solid border-b-[2px] border-primary"
                  : ""
              }`}
            >
              <Typography
                textColor={`${
                  active === item.item ? "text-primary" : "text-dark"
                }`}
                textWeight="font-[400]"
                textSize="text-[14px]"
              >
                {item.item}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CustomizeNav;
