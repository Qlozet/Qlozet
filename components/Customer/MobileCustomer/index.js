import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import Image from "next/image";
import { setCustomerId } from "@/utils/localstorage";
const MobileCutomerItem = ({
  picture,
  customerName,
  status,
  totalOrders,
  lastOrderDate,
  phone,
  emailAddress,
  viewDetails,
  customerId,
}) => {
  return (
    <div>
      <div className="flex gap-6 mb-4 bg-white ">
        <div className="bg-primary w-1 h-[10rem]"></div>
        <div className=" w-full flex flex-col  justify-between py-5 pr-4">
          <div className="flex items-center gap-3">
            <div className="w-[2rem] h-[2rem] bg-primary rounded-[12px] flex items-center justify-center">
              <Image src={exportIcon} />
            </div>
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize=""
            >
              {customerName}
            </Typography>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize=""
            >
              Total Orders
            </Typography>
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize=""
            >
              {totalOrders}
            </Typography>
          </div>
          <div>
            <Button
              children="View Customer"
              btnSize="large"
              variant="outline"
              clickHandler={() => {
                setCustomerId(customerId);
                viewDetails(customerId);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCutomerItem;
