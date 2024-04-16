import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
const OrderDetailNav = ({ active }) => {
  return (
    <div className="w-[40%] bg-white py-8 px-5 rounded-t-[18px]">
      <div className="flex justify-between items-center border-gray-200 border-b-[1.5px] border-dashed mb-[-2px]">
        <div className="flex gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-bold"
                  textSize="text-[16px]"
                >
                  Order details
                </Typography>
                {active === "Order details" && (
                  <div className="w-full h-[4px] rounded-t-[12px] bg-primary translate-y-[4px]"></div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-bold"
                  textSize="text-[16px]"
                >
                  Track order
                </Typography>
                {active === "Track order" && (
                  <div className="w-full h-[4px] rounded-t-[12px] bg-primary translate-y-[1.2px]"></div>
                )}{" "}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-bold"
                  textSize="text-[16px]"
                >
                  Customer details
                </Typography>
                {active === "Customer details" && (
                  <div className="w-full h-[4px] rounded-t-[12px] bg-primary translate-y-[2px]"></div>
                )}{" "}
              </div>
              {/* <Image src={closeIcom} alt="" /> */}
            </div>
          </div>
        </div>
        <Image src={closeIcon} alt="" className="translate-y-[-15px]" />
      </div>
    </div>
  );
};
export default OrderDetailNav;
