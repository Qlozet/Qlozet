const { default: Typography } = require("../Typography");

const Size = ({ value, borderColor }) => {

  return (
    <div className={`flex items-center justify-center w-[3rem] h-[2rem] ${borderColor ? " border-primary" : "border - gray - 300"} border-solid border-[1.5px] rounded-md`}>
      <Typography
        textColor="text-primary"
        textWeight="font-medium"
        textSize="text-sm"
      >
        {value}
      </Typography>
    </div>
  );
};

export default Size;
