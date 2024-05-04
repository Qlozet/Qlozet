const ChatLabel = () => {
  return (
    <div className="flex items-center justify-center gap-10 ">
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%] bg-primary"></div>
        <p className=" bg-primary">Male</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%] bg-primary-100"></div>
        <p className=" bg-primary">Female</p>
      </div>
    </div>
  );
};

export default ChatLabel;
