import Image from "next/image";
import icon from "@/public/assets/svg/image-frame.svg";
import { useEffect, useState } from "react";
const VariantImage = ({ submitImage, id, imageIndex, color, source }) => {
  console.log(source)
  const [file, setFile] = useState("");

  useEffect(() => {
    if (source) {
      setFile(source)
    }
  }, [source])
  return (
    <div>
      <input
        className="hidden"
        type="file"
        id={`variantImage${id}${imageIndex}`}
        onChange={(e) => {
          setFile(e.target.files[0]);
          submitImage(e.target.files[0], id, imageIndex, color);
          e.target.value = ""
        }}
      />
      <label
        htmlFor={`variantImage${id}${imageIndex}`}
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
