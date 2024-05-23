import HorizontalChatBar from "../HorizontalChatBar";
const HorizontalChat = ({ data }) => {
  return (
    <div className="h-[200px] ">
      {data.map((item, index) => {
        return (
          <div className={`${index !== 0 && "mt-8"}`} key={index}>
            <HorizontalChatBar
              location={item.location}
              male={item.male}
              female={item.female}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalChat;
