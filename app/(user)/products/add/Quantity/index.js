import Typography from "@/components/Typography";

const AddQuantity = ({QuantityHandler,quantity}) => {
  return (
    <div className="flex items-center py-1 px-4 rounded-[6px] justify-between border-[1px] border-solid border-gray-300">
      <div>
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          -
        </Typography>
      </div>
      <div>
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          0
        </Typography>
      </div>
      <div>
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          +
        </Typography>
      </div>
    </div>
  );
};
export default AddQuantity;
