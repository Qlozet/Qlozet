import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
const OrderDetailNav = ({ active, data, closeModal, width }) => {
  return (
    <div
      className={`${
        width ? width : "w-[40%]"
      }  bg-white py-8 px-5 rounded-t-[18px]`}
    >
      <div className="flex justify-between items-center border-gray-200 border-b-[1.5px] border-dashed mb-[-2px]">
        <div className="flex gap-4">
          {data.map((item) => (
            <div onClick={item.handleFunction}>
              <div className="flex items-center justify-between cursor-pointer">
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
        <div onClick={closeModal} className="cursor-pointer">
          <Image src={closeIcon} alt="" className="translate-y-[-15px]" />
        </div>
      </div>
    </div>
  );
};
export default OrderDetailNav;
