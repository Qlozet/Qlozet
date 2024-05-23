const HorizontalChatBar = ({ location, male, female }) => {
  return (
    <div className="mb-4">
      <div>
        {male < female && (
          <div
            className={`
        bg-primary-200 rounded-r-[40px] block`}
            style={{ width: `${female < 70 ? female + 70 : female}%` }}
          >
            <div
              className={`bg-primary rounded-r-[40px] block`}
              style={{ width: `${male < 70 ? male + 70 : male}%` }}
            >
              <p className="py-1 px-2 text-white text-[12px] font-[500]">
                {location}
              </p>
            </div>
          </div>
        )}
        {male > female && (
          <div
            className={`bg-primary rounded-r-[40px] block`}
            style={{ width: `${male < 70 ? male + 70 : male}%` }}
          >
            <div
              className={`
        bg-primary-200 rounded-r-[40px]`}
              style={{ width: `${female < 70 ? female + 70 : female}% block` }}
            >
              <p className="py-1 px-2 text-white text-[12px] font-[500]">
                {location}
              </p>
            </div>
          </div>
        )}
        {male === female && (
          <div
            className={`bg-primary rounded-r-[40px] block`}
            style={{ width: `${male < 70 ? male + 70 : male}%` }}
          >
            <p className="py-1 px-2 text-white text-[12px] font-[500]">
              {location}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalChatBar;
