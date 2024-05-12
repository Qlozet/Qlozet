import customisationIcon from "../../public/assets/svg/customisation-icon.svg";
import Image from "next/image";
const CustomiSationButton = () => {
  return (
    <div className="flex items-center justify-center border-solid border-[2px] border-gray-300 w-[4.5rem] h-[4.5rem]">
      <div>
        <Image src={customisationIcon} />
      </div>
    </div>
  );
};

export default CustomiSationButton;
