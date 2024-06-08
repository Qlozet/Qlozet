const { default: Typography } = require("../Typography");

const Size = ({ value }) => {
  console.log(value);
  return (
    <div className=" flex items-center justify-center w-[3rem] h-[2rem] border-gray-300 border-solid border-[1.5px] rounded-[6px]">
      <Typography
        textColor="text-primary"
        textWeight="font-[500]"
        textSize="text-[14px]"
      >
        {value == "Extra small" && "ES"}
        {value == "Small" && "S"}
        {value == "Medium" && "M"}
        {value == "Large" && "L"}
        {value == "Extra large" && "XL"}
      </Typography>
    </div>
  );
};

export default Size;
