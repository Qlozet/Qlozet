const HorizontalChatBar = ({ location, male, female }) => {
  return (
    <div className="mb-4">
      <div className={`${male} bg-primary-200 rounded-r-[40px]`}>
        <div className={`bg-primary ${female}  rounded-r-[40px]`}>
          <p className="py-1 px-2 text-white text-[12px] font-[500]">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HorizontalChatBar;
