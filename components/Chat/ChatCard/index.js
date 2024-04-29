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
    <div className="shadow-md bg-white rounded-[12px] p-6 w-full h-[24rem] relative z-0">
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
