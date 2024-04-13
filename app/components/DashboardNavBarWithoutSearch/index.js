import Typography from "../Typography";
import Image from "next/image";
import searchNormalicon from "../../../public/assets/svg/search-normal.svg";
import notificationIcon from "../../../public/assets/svg/notification-bing.svg";
import userIcon from "../../../public/assets/svg/user-octagon.svg";
const DasboardNavWithOutSearch = ({ vendor, page }) => {
  return (
    <div className="flex items-center justify-between bg-white shadow-2xl py-2 px-6 rounded-[12px]">
      <Typography
        textColor="text-black"
        textWeight="font-bold"
        textSize="text-[18px]"
      >
        Dashboard
      </Typography>
      <div className="flex items-center justify-end gap-6">
        <div className="relative   min-w-96">
          <div className="absolute left-2 top-[10px]">
            <Image alt="" src={searchNormalicon} />
          </div>
          <input
            placeholder="Search"
            className={`py-2 pl-12 w-full border-solid border-[1.5px]
          focus:outline-none focus:border-primary-100 border-gray-2 rounded-[12px] overflow-hidden text-[14px] text-font-light placeholder:font-300  bg-[#F8F9FA] 
          } `}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-12px] p-2 bg-[#F8F9FA]">
            <Image alt="" src={notificationIcon} />
          </div>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[16px]"
          >
            Miskay Boutique
          </Typography>
          <div className="rounded-[12px] p-2 bg-[#F8F9FA]">
            <Image alt="" src={userIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DasboardNavWithOutSearch;
