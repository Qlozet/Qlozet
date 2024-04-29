import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../Typography";
const OrderDetailNav = ({ active, data, closeModal, width, full, bg }) => {
  return (
    <div
      className={`${width ? width : "w-[40%]"} ${
        bg ? bg : "bg-white "
      } py-8 px-5 rounded-t-[18px] flex justify-between items-center`}
    >
      <div className="flex justify-between items-center border-gray-200 border-b-[1.5px] border-dashed mb-[-2px] w-full">
        <div
          className={`flex justify-between items-center ${
            full ? "w-full" : "gap-4"
          } `}
        >
          {data.map((item) => (
            <div
              onClick={() => {
                item.handleFunction(item.item);
              }}
            >
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
