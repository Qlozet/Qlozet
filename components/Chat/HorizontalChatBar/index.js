const HorizontalChatBar = ({ location, male, female }) => {
  return (
    <div className="mb-4">
      <div>
        {male < female && (
          <div
            className={`
        bg-primary-200 rounded-r-[55px] block`}
            style={{ width: `${female < 55 ? female + 55 : female}%` }}
          >
            <div
              className={`bg-primary rounded-r-[55px] block`}
              style={{ width: `${male < 55 ? male + 55 : male}%` }}
            >
              <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                {location}
              </p>
            </div>
          </div>
        )}
        {male > female && (
          <div
            className={`bg-primary rounded-r-[55px] block`}
            style={{ width: `${male < 55 ? male + 55 : male}%` }}
          >
            <div
              className={`
        bg-primary-200 rounded-r-[55px]`}
              style={{ width: `${female < 55 ? female + 55 : female}% block` }}
            >
              <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
                {location}
              </p>
            </div>
          </div>
        )}
        {male === female && (
          <div
            className={`bg-primary rounded-r-[55px] block`}
            style={{ width: `${male < 55 ? male + 55 : male}%` }}
          >
            <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
              {location}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalChatBar;
