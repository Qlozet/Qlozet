import customisationIcon from "../../public/assets/svg/customisation-icon.svg";
import Image from "next/image";
const CustomiSationButton = ({ handleClick }) => {
  return (
    <div
      className="rounded cursor-pointer flex items-center justify-center border-solid border-[2px] border-gray-300 w-[4.5rem] h-[4.5rem]"
      onClick={handleClick}
    >
      <div>
        <Image src={customisationIcon} alt="" />
      </div>
    </div>
  );
};

export default CustomiSationButton;
