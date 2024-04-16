import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
const OrderDetailNav = ({ active }) => {
  const topNavData = [
    {
      item: "Order details",
      link: "",
    },
    {
      item: "Track order",
      link: "",
    },
    {
      item: "Order details",
      link: "",
    },
  ];
  return (
    <div className="w-[40%] bg-white py-8 px-5 rounded-t-[18px]">
      <div className="flex justify-between items-center border-gray-200 border-b-[1.5px] border-dashed mb-[-2px]">
        <div className="flex gap-4">
          {topNavData.map((item) => (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[16px]"
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
        <Image src={closeIcon} alt="" className="translate-y-[-15px]" />
      </div>
    </div>
  );
};
export default OrderDetailNav;
