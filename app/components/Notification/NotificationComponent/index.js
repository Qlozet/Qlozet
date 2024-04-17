import Typography from "../../Typography";

const Notification = () => {
  return (
    <div className="flex items-center justify-between border-b-[1px] border-solid border-gray-300 py-4 px-6">
      <div className="flex items-center gap-2">
        <div className="w-[1rem] h-[1rem] bg-dark rounded-[50%] translate-y-[-9px]"></div>
        <div>
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[18px]"
          >
            Order Shipped
          </Typography>
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            Amasi’s dress has been shipped to 15b, Kenny street, Lagos Nigeria
            to Doyin Oyinkansola
          </Typography>
        </div>
      </div>
      <div>
        <Typography
          textColor="text-gray-1"
          textWeight="font-normal"
          textSize="text-[14px]"
        >
          May 25, 2023 . 12:25pm
        </Typography>
      </div>
    </div>
  );
};

export default Notification;
