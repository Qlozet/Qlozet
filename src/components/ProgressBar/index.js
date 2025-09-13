const ProgressBar = ({ step }) => {
  return (
    <>
      <div className="h-[7px] w-full bg-gray-300 rounded-[8px] relative">
        {step == 1 && (
          <span
            className={`h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]
          `}
            style={{ width: "20%" }}
          ></span>
        )}
        {step == 2 && (
          <span
            className={`h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]
          `}
            style={{ width: "40%" }}
          ></span>
        )}
        {step == 3 && (
          <span
            className={`h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]
          `}
            style={{ width: "60%" }}
          ></span>
        )}
        {step == 4 && (
          <span
            className={`h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]
          `}
            style={{ width: "80%" }}
          ></span>
        )}
        {step == 5 && (
          <span
            className={`h-full bg-primary inline-block absolute top-0 left-0 rounded-[8px]
          `}
            style={{ width: "95%" }}
          ></span>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
