import Typography from "@/components/Typography";

const Quantity = ({ variant, quantity }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center p-2 rounded bg-success text-white min-w-[1.5rem] h-[1.5rem] text-[12px] font-[500]">
        {quantity}

      </div>
      <Typography
        textColor="text-dark"
        textWeight="font-normal"
        textSize="text-[14px]"
      >
        In
      </Typography>
      <div className="flex items-center justify-center p-2 rounded bg-gray-300 text-dark min-w-[1.5rem] h-[1.5rem] text-[12px] font-[500]">
        {variant}
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
