import Image from "next/image";
import icon from "../../../public/assets/svg/image-frame.svg";
import { useState } from "react";
const VariantImage = ({ submitImage, listIndex, imageIndex }) => {
  const [file, setFile] = useState("");
  return (
    <div>
      <input
        className="hidden"
        type="file"
        id={`variantImage${listIndex}${imageIndex}`}
        onChange={(e) => {
          setFile(e.target.files[0]);
          submitImage(e.target.files[0], listIndex, imageIndex);
        }}
      />
      <label
        htmlFor={`variantImage${listIndex}${imageIndex}`}
        className="cursor-pointer"
      >
        <Image
          src={!file ? icon : URL.createObjectURL(file)}
          width={500}
          height={500}
          style={{ width: "2.5rem", height: "2.5rem" }}
          alt=""
          className="max-w-[2.5rem] h-[auto] rounded-[3px]"
        />
      </label>
    </div>
  );
};

export default VariantImage;
