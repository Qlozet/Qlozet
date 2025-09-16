import Typography from "@/components/Typography";
import Image from "next/image";
import closeIcon from "@/public/assets/svg/material-symbol-close-icon.svg";
import { useEffect, useState } from "react";
const Design = ({ id, image, name, reduce }) => {
  const [selected, setSelected] = useState(false);

  let data = [];
  const selecteHandler = () => {
    setSelected(true);
    const localData = localStorage.getItem("styleTypes");
    if (!localData) {
      data = [{ id, name, image }];
    } else {
      const savedData = JSON.parse(localData);
      data = [...savedData, { id, name, image }];
    }
    localStorage.setItem("styleTypes", JSON.stringify(data));
  };

  const handleUnselect = () => {
    const localData = localStorage.getItem("styleTypes");
    if (localData) {
      const savedData = JSON.parse(localData);
      const checkIfSelected = savedData.filter((item) => item.id !== id);
      localStorage.setItem("styleTypes", JSON.stringify(checkIfSelected));
    }
    setSelected(false);
  };

  useEffect(() => {
    const localData = localStorage.getItem("styleTypes");
    if (localData) {
      const savedData = JSON.parse(localData);
      const checkIfSelected = savedData.filter((item) => item.id === id);
      checkIfSelected.length > 0 && setSelected(true);
    }
  }, [selected]);

  return (
    <div
      className={` flex-col gap-2   ${reduce ? "items-center" : ""
        }  justify-center border-solid  rounded-md ${reduce ? "" : ""
        }`}
    >
      <div className="relative">
        {selected && (
          <div>
            <div className="absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,.5)] w-full h-full z-10"></div>
            <div
              className="absolute top-0 right-1 z-20 bg-danger rounded-[50%] p-[2px] cursor-pointer"
              onClick={handleUnselect}
            >
              <Image src={closeIcon} alt="" width={18} height={18} />
            </div>
          </div>
        )}

        <div>
          <Image
            src={image}
            alt=""
            className={`${reduce ? "w-[100%]" : "w-full h-auto"
              } cursor-pointer `}
            onClick={selecteHandler}
            width={18}
            height={18}
            unoptimized
          />
        </div>
      </div>

      <Typography
        textColor="text-dark"
        textWeight="font-medium"
        textSize="text-xs"
        align="center"
      >
        {name}
      </Typography>
    </div>
  );
};

export default Design;
