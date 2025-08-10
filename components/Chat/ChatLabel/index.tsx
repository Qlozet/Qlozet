import React from 'react';

const ChatLabel: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-10 ">
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%] bg-primary"></div>
        <p className=" text-dark">Male</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-[50%] bg-primary-200"></div>
        <p className="text-dark">Female</p>
      </div>
    </div>
  );
};

export default ChatLabel;