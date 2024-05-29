import Image from "next/image";
import activeDashboardIcon from "../../public/assets/svg/activeDashboardIcon.svg";
import arrowUpSuccess from "../../public/assets/svg/arrowup-success.svg";
import eyeSuccess from "../../public/assets/svg/eye-success.svg";
import cartWhite from "../../public/assets/svg/cart-white.svg";

const DashboardTopCard = ({
  name,
  bgColor,
  icon,
  total,
  percentage,
  link,
  addMaxWidth,
}) => {
  return (
    <div
      className={`min-w-[260px] lg:min-w-[0] p-6 flex bg-white rounded-[12px] mt-4 ${
        addMaxWidth ? "min-w-[260px] max-w-[260px]" : ""
      }  w-full`}
    >
      <div
        className={`w-[48px] h-[48px] flex items-center justify-center ${bgColor} rounded-[8px]`}
      >
        <Image src={icon} alt="" />
      </div>
      <div className="pl-4">
        <div>
          <p className="text-[12px] text-gray-100">{name}</p>
          <p className="font-bold text-[24px] text-[#495057]">{total}</p>
        </div>
        <div className="flex justify-between items-center gap-12">
          <div className="flex items-center gap-1">
            <p className="text-[12px] text-[#33CC33]">{percentage}</p>
            <Image src={arrowUpSuccess} alt="" />
          </div>
          {link && (
            <div className="flex items-center gap-1 cursor-pointer">
              <p className="text-[12px] text-[#33CC33]">View</p>
              <Image src={eyeSuccess} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardTopCard;
