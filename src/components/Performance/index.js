const Performance = ({ name, value, color }) => {
  return (
    <div className="flex items-center w-full justify-between gap-4 my-2">
      <div className=" w-[30%]">{name}</div>
      <div className="w-[65%]">
        <div className="h-3 rounded-[15px] bg-gray-300">
          <div
            className={`${color} h-3 rounded-[15px]`}
            style={{
              width: `${value}%`,
            }}
          ></div>
        </div>
      </div>
      <div className="w-[10%]">{value}</div>
    </div>
  );
};

export default Performance;
