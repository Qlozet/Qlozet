const DashedComponent = ({ name }) => {
  return (
    <div className="items-center justify-between my-4 hidden lg:flex">
      <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
      <div className="min-w-[9rem] flex items-center justify-center">
        {name}
      </div>
      <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
    </div>
  );
};

export default DashedComponent;
