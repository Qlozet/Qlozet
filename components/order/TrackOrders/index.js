import OrderDetailNav from "../OrderdetailsNav";
import defaultImage from "../../../public/assets/image/default.png";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../OrderStatus";
import Button from "../../Button";
import OrderStep from "../OrderStep";
import TracKOrderCard from "../TrackOrderCard";
import shopIcon from "../../../public/assets/svg/order-shop.svg";
import clockIcon from "../../../public/assets/svg/order-clock.svg";
import orderBag from "../../../public/assets/svg/order-shopping-bag.svg";
const TrackOrder = ({ data, closeModal }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      <OrderDetailNav
        active="Track order"
        data={data}
        closeModal={closeModal}
      />
      <div className=" w-[40%] bg-white rounded-b-[14px] pt-4 pb-12 ">
        <div className=" py-4 border-gray-300 border-solid border-[1.5px] w-[95%] m-auto rounded-[12px]">
          <div className="flex justify-between items-center border-solid border-b-[1px] border-gray-300 py-6">
            <TracKOrderCard
              text="Order ID"
              item={"#12345678"}
              icon={shopIcon}
              bgColor={"bg-[#57CAEB]"}
            />
            <TracKOrderCard
              text="Order ID"
              item={"#12345678"}
              icon={clockIcon}
              bgColor={"bg-[#5DDAB4]"}
            />
            <TracKOrderCard
              text="Order ID"
              item={"#12345678"}
              icon={orderBag}
              bgColor={"bg-[#FF9E57]"}
            />
          </div>
          <div className="px-12 py-8">
            <OrderStep step={2} />
          </div>
          <div className="w-[95%] border-solid border-gray-300 border-t-[1px] px-10 py-6">
            <div className="flex items-center gap-4">
              <div className="w-[4rem] h-[4rem] flex justify-center items-center bg-[#09A346] rounded-[50%]">
                <Image src={shopIcon} />
              </div>
              <div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-bold"
                  textSize="text-[14px]"
                  align="center"
                >
                  +234 8103456789
                </Typography>{" "}
                <Typography
                  textColor="text-dark"
                  textWeight="font-normal"
                  textSize="text-[14px]"
                  align="center"
                >
                  Order taken by Salims
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrackOrder;
