import VendorCountLine from "../VendorCountLine";
import VerticalBar from "../VerticalBar";

const VerticalBarGraph = () => {
  return (
    <div className="relative">
      <div>
        <VendorCountLine value={"11,000"} />
        <VendorCountLine value={"10,000"} />
        <VendorCountLine value={"9,000"} />
        <VendorCountLine value={"8,000"} />
        <VendorCountLine value={"7,000"} />
        <VendorCountLine value={"6,000"} />
        <VendorCountLine value={"5,000"} />
        <VendorCountLine value={"4,000"} />
        <VendorCountLine value={"3,000"} />
        <VendorCountLine value={"2,000"} />
        <VendorCountLine value={"1,000"} />
        <VendorCountLine value={"0"} />
      </div>
      <div className="absolute right-0 bottom-[9px] w-[94%] h-[96%] flex justify-between px-10">
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
      </div>
    </div>
  );
};

export default VerticalBarGraph;
