import Image from "next/image";
import closeIcom from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
const OrderDetailNav = ({ active }) => {
  return (
    <div className="w-[50%] bg-white p-4 rounded-t-[18px]">
      <div className="flex justify-between items-center border-gray-200 border-b-[2px] border-dashed mb-[-2px]">
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
                  <div className="w-full h-[6px] rounded-t-[12px] bg-primary translate-y-[4px]"></div>
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
                  <div className="w-full h-[6px] rounded-t-[12px] bg-primary translate-y-[4px]"></div>
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
                  <div className="w-full h-[6px] rounded-t-[12px] bg-primary translate-y-[4px]"></div>
                )}{" "}
              </div>
              {/* <Image src={closeIcom} alt="" /> */}
            </div>
          </div>
        </div>
        <Image src={closeIcom} alt="" />
      </div>
    </div>
  );
};
export default OrderDetailNav;
