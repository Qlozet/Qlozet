import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
import classes from "./index.module.css";
const OrderDetailNav = ({
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
      className={`${width ? width : "w-full lg:w-[40%]"} ${bg ? bg : "bg-white "
        } py-8 px-5 rounded-t-[18px] flex justify-between items-center overflow-x-scroll ${classes.scrollbarElement
        }`}
    >
      <div className="flex justify-between items-center border-gray-200 border-b-[0] lg:border-b-[1.5px] border-dashed mb-[-2px] w-full">
        <div
          className={`flex justify-between items-center ${full ? "w-full" : " gap-4 lg:gap-12"
            } `}
        >
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.handleFunction(item.item);
              }}
              className={`${item.navWidth} `}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <Typography
                    textWeight="font-[400]"
                    textSize="text-[14px]"
                    textColor={active ? "text-dark" : "text-primary"}
                  >
                    {item.item}
                  </Typography>
                  {item.item === active && (
                    <div className="w-full h-[4px] rounded-t-[12px] bg-primary translate-y-[2px]"></div>
                  )}
                </div>
                {/* <Image src={closeIcom} alt="" /> */}
              </div>
            </div>
          ))}
        </div>
        {!full && (
          <div onClick={closeModal} className="cursor-pointer">
            <Image src={closeIcon} alt="" className="translate-y-[-15px]" />
          </div>
        )}
      </div>
    </div>
  );
};
export default OrderDetailNav;
