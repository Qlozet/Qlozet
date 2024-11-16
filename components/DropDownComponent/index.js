const DropDownComponent = ({ data, dropdownTitle, width, clickHandler }) => {
  return (
    <div
      className={`${width} bg-white rounded-[12px] border-[1px] border-solid border-gray-200 overflow-hidden`}
    >
      <div>
        <div className="p-4 text-gray-100 border-b-[1px] border-solid border-gray-200">
          {dropdownTitle}
        </div>
        {data.map((item) => (
          <div
            className="p-4 text-sm cursor-pointer hover:bg-[#f4f4f4]"
            onClick={() => {
              clickHandler(item);
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropDownComponent;
