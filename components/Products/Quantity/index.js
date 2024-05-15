import Typography from "@/components/Typography";

const Quantity = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center p-2 rounded bg-success text-white w-[1.5rem] h-[1.5rem] text-[12px] font-[500]">
        1
      </div>
      <Typography
        textColor="text-dark"
        textWeight="font-normal"
        textSize="text-[14px]"
      >
        In
      </Typography>
      <div className="flex items-center justify-center p-2 rounded bg-gray-300 text-dark w-[1.5rem] h-[1.5rem] text-[12px] font-[500]">
        1
      </div>
      <Typography
        textColor="text-dark"
        textWeight="font-normal"
        textSize="text-[14px]"
      >
        variant
      </Typography>
    </div>
  );
};

export default Quantity;
