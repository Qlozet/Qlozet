import Typography from "../../Typography";
import ChatLabel from "../ChatLabel";
const ChatCard = ({ text, graph }) => {

  return (
    // shadow-md
    <div className=" bg-white rounded-[12px] p-6 w-full h-[22rem] flex flex-col justify-between ">
      <div>
        <Typography
          textColor="text-gray-100"
          textWeight="font-bold"
          textSize="text-sm"
        >
          {text}
        </Typography>
      </div>
      {graph}
      {text === "Vendors by gender"}
      <div className={`${text === "Vendors by gender" ? "" : ""}`}>
        <ChatLabel />
      </div>
    </div>
  );
};

export default ChatCard;
