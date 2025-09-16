import Image from "next/image";
import Typography from "../Typography";
import infoIcon from "@/public/assets/svg/Info Circle.svg";
const UpdateComponent = () => {
  return (
    <div className="bg-[#FFF7DE] px-12 py-2 rounded-[12px] flex items-center gap-6">
      <div>
        <div className="w-[3rem] h-[3rem]">
          {" "}
          <Image src={infoIcon} alt="" />
        </div>
      </div>
      <div>
        <Typography
          textColor="text-gray-100"
          textWeight="font-normal"
          textSize="text-sm"
        >
          To access all ALTIREs service, please complete your KYC verification
          process
        </Typography>
        <div className=" border-b-[#FFB020] border-solid border-b-[1.5px] max-w-[6.3rem]">
          <Typography
            textColor="text-[#FFB020]"
            textWeight="font-[600]"
            textSize="text-sm"
          >
            Update Profile
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default UpdateComponent;
