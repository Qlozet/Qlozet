const HorizontalChatBar = ({ text, total, percentage }) => {
  return (
    <div className="mb-4">
      <div className={`${total} bg-primary-100 rounded-r-[40px]`}>
        <div className={`bg-primary ${percentage}  rounded-r-[40px]`}>
          <p className="py-2 px-4 text-white text-[12px] font-[500]">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default HorizontalChatBar;
