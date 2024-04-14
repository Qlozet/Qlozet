import Typography from "../Typography";
const VendorCountLine = ({ value }) => {
  return (
    <div className="mt-4">
      <div className="flex  gap-4">
        <div className="min-w-[3rem]">
          <Typography
            textColor="text-gray-100"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            {value}
          </Typography>
        </div>

        <div className="border-dashed border-t-[1.5px] border-gray-200 w-full translate-y-[10px] border-spacing-x-0.5"></div>
      </div>
    </div>
  );
};

export default VendorCountLine;
