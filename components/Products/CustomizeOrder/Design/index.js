import Typography from "@/components/Typography";
import Image from "next/image";

const Design = ({ image, name, reduce }) => {
  return (
    <div
      className={`flex flex-col gap-2 ${
        reduce ? "items-center" : ""
      }  justify-center border-solid  rounded-[6px] ${
        reduce ? "" : "min-w-[5rem]"
      }`}
    >
      <Image
        src={image}
        alt=""
        className={`${reduce ? "w-[100%]" : "w-[4rem] h-[4rem]"} `}
      />
      <Typography
        textColor="text-dark"
        textWeight="font-[400]"
        textSize="text-[10px]"
        align="center"
      >
        {name}
      </Typography>
    </div>
  );
};

export default Design;
