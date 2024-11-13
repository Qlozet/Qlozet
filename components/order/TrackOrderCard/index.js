import Image from "next/image";
import Typography from "../../Typography";

const TracKOrderCard = ({ item, text, icon, bgColor }) => {
  return (
    <div className="flex items-center justify-center flex-col">
      <div
        className={`${bgColor} flex items-center justify-center w-[2rem] lg:w-[3rem] h-[2rem] lg:h-[3rem] rounded-[50%]`}
      >
        <Image src={icon} alt="" />
      </div>
      <div className="flex flex-col justify-center items-center px-2">
        <div className="py-[8px]">
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[14px]"
            align="center"
          >
            {item}
          </Typography>
        </div>
        <Typography
          textColor="text-primary"
          textWeight="font-normal"
          textSize="text-xs"
          align="center"
        >
          {text}
        </Typography>
      </div>
    </div>
  );
};

export default TracKOrderCard;
