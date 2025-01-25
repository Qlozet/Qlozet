import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbol-close-icon.svg";
import { useState } from "react";

const SelectedFile = ({ removeItemFromList, index, item }) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <div
      className="relative cursor-pointer h-full"
      onMouseEnter={() => {
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setIsActive(false);
      }}
      onClick={() => {
        setIsActive(!isActive);
      }}
    >
      {/* <div className="min-w-[5rem] h-[auto] rounded"
        style={{ backgroundImage: `url(${item.secure_url})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}></div> */}
      <div className="w-[106px] h-full border-[1px] border-solid border-gray-200 rounded-lg relative" style={{ backgroundImage: `url(${item.secure_url})`, backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat", height: "100%" }}>
        {isActive && (
          <div className="absolute right-0 top-0 w-full h-full bg-[rgba(0,0,0,.3)] rounded">
            <div
              className="absolute right-[-0.3rem] top-[-0.3rem] rounded-[50%] cursor-pointer bg-primary"
              onClick={() => {
                removeItemFromList(index);
              }}
            >
              <Image src={closeIcon} alt={""} width={18} height={18} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default SelectedFile;
