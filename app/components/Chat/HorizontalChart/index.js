import HorizontalChatBar from "../HorizontalChatBar";
const HorizontalChat = ({ data }) => {
  return (
    <div>
      {data.map((item, index) => {
        return (
          <div className="mt-8" key={index}>
            <HorizontalChatBar
              text={item.location}
              total={item.total}
              percentage={item.percentage}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalChat;
