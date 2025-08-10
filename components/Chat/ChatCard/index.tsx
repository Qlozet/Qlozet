import React from 'react';
import Typography from "../../Typography";
import ChatLabel from "../ChatLabel";

interface ChatCardProps {
  text: string;
  graph: React.ReactNode;
}

const ChatCard: React.FC<ChatCardProps> = ({ text, graph }) => {
  return (
    <div className="bg-white rounded-[12px] p-6 w-full h-[22rem] flex flex-col justify-between shadow-[0px_4px_10px_#AEAEC026]">
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
      {text === "Vendors by gender" && (
        <div>
          <ChatLabel />
        </div>
      )}
    </div>
  );
};

export default ChatCard;