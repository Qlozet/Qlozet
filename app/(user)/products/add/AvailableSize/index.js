import Typography from "@/components/Typography";

const AvailableSize = () => {
  return (
    <div>
      <div>
        <div className="flex items-center gap-2">
          <div className=" flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
            <Typography
              textColor="text-primary"
              textWeight="font-[500]"
              textSize="text-[16px]"
            >
              S
            </Typography>
          </div>
          <div className=" flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
            <Typography
              textColor="text-primary"
              textWeight="font-[500]"
              textSize="text-[16px]"
            >
              M
            </Typography>
          </div>
          <div className=" flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
            <Typography
              textColor="text-primary"
              textWeight="font-[500]"
              textSize="text-[16px]"
            >
              L
            </Typography>
          </div>
          <div className=" flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
            <Typography
              textColor="text-primary"
              textWeight="font-[500]"
              textSize="text-[16px]"
            >
              XL
            </Typography>
          </div>
          <div className=" flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
            <Typography
              textColor="text-primary"
              textWeight="font-[500]"
              textSize="text-[16px]"
            >
              XXL
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableSize;
