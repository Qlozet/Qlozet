import { useEffect, useState } from "react";
import VendorCountLine from "../VendorCountLine";
import VerticalBar from "../VerticalBar";
import Typography from "../Typography";
import DropDown from "../DropDown";

const VerticalBarGraph = () => {
  const [data, setData] = useState([
    { date: "June 1", value: 5100 },
    { date: "June 2", value: 4200 },
    { date: "June 3", value: 4900 },
    { date: "June 4", value: 4300 },
    { date: "June 5", value: 6100 },
    { date: "June 6", value: 5300 },
    { date: "June 7", value: 5300 },
  ]);

  const itemWithHighestValue = data.reduce((prevItem, currentItem) => {
    return prevItem.value > currentItem.value ? prevItem : currentItem;
  });

  return (
    <div className="relative">
      <div className="flex my-4 items-center justify-between">
        <Typography
          textColor="text-black"
          textWeight="font-bold"
          textSize="text-[16px]"
        >
          Total order count
        </Typography>
        <DropDown
          data={[
            "This week",
            "Last week",
            "Last month",
            "This month",
            "Choose month",
            "Custom",
          ]}
          maxWidth={"max-w-[10rem]"}
          placeholder="Time Range"
          setValue={(data) => {}}
          bg={"bg-white"}
        />
      </div>
      <div className="">
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
        <div className="mb-[1rem] md:mb-0">
          <VendorCountLine value={"0"} />
        </div>
      </div>
      <div className="absolute right-0 bottom-[.6rem] md:bottom-[9px]  w-[94%] h-[96%] flex justify-between px-10">
        {data.map((item, index) => {
          return (
            <VerticalBar
              highest={item.value == itemWithHighestValue.value ? true : false}
              per={item.per}
              value={item.value}
              date={item.date}
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VerticalBarGraph;
