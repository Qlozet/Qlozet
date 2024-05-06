import Typography from "../../Typography";
import ChatLabel from "../ChatLabel";
const ChatCard = ({ text, graph }) => {
  const chartData = {
    labels: ["Male", "Female"],
    values: [12, 19],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };
  return (
    // shadow-md
    <div className=" bg-white rounded-[12px] p-6 w-full h-[22rem] relative z-0 flex flex-col justify-between">
      <div>
        <Typography
          textColor="text-gray-100"
          textWeight="font-bold"
          textSize="text-[14px]"
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
