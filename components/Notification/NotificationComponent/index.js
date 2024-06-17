import moment from "moment";
import Typography from "../../Typography";

const Notification = ({ read, title, desc, date }) => {
  return (
    <div className="block lg:flex items-center justify-between border-b-[1px] border-solid border-gray-300 py-4 px-6">
      <div className="flex items-center gap-2">
        <div className="flex items-start">
          <div
            className={`w-[1rem] h-[1rem] ${
              read ? "bg-dark" : "bg-[#DDE2E5]"
            }  rounded-[50%] `}
          ></div>
        </div>

        <div className="ml-4 lg:ml-0">
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[18px]"
          >
            {title}
          </Typography>
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            {desc}
          </Typography>
        </div>
      </div>
      <div className="ml-10 lg:ml-0 py-3 lg:py-0">
        <Typography
          textColor="text-gray-1"
          textWeight="font-normal"
          textSize="text-[14px]"
        >
          {moment(date).format("DD/MM/YYYY")}
        </Typography>
      </div>
    </div>
  );
};

export default Notification;
