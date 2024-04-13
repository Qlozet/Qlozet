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
    <div className="shadow-2xl bg-white rounded-[12px] p-6">
      <div>
        <Typography
          textColor="text-gray-100"
          textWeight="font-bold"
          textSize="text-[14px]"
        >
          Orders by gender
        </Typography>
      </div>
      {graph}
      <ChatLabel />
    </div>
  );
};

export default ChatCard;
