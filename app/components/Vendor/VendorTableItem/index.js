import threeDotIcon from "../../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import VendorStatus from "../VendorStatus";
const VendorTableItem = ({
  vendorName,
  address,
  dateOnboarded,
  onboardedBy,
  vendorStatus,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[14px] font-normal p-4">{vendorName}</td>
      <td className="text-[14px] font-normal p-4">{address}</td>
      <td className="text-[14px] font-normal p-4">{dateOnboarded}</td>
      <td className="text-[14px] font-normal p-4">{onboardedBy}</td>
      <td className="text-[14px] font-normal p-4">
        <VendorStatus
          text="Awaiting verification"
          bgColor="bg-[#33CC331A]"
          color="text-[#33CC33]"
        />
      </td>
      <td className="text-[14px] font-normal p-4">
        <Image src={threeDotIcon} />
      </td>
    </tr>
  );
};

export default VendorTableItem;
