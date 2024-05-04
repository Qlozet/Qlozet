const ChatLabel = () => {
  return (
    <div className="flex items-center justify-center gap-10 ">
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%]"></div>
        <p className=" text-dark">Male</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%]"></div>
        <p className="text-dark">Female</p>
      </div>
    </div>
  );
};

export default ChatLabel;
