import { useEffect, useState } from "react";
import VendorCountLine from "../VendorCountLine";
import VerticalBar from "../VerticalBar";
import Typography from "../Typography";
import DropDown from "../DropDown";
import { current } from "@reduxjs/toolkit";

const VerticalBarGraph = ({ data, name }) => {
  // console.log(data);
  const daysArray = [
    {
      day: "Mon",
      value: data.Monday,
    },
    {
      day: "Tue",
      value: data.Tuesday,
    },
    {
      day: "Wed",
      value: data.Wednesday,
    },
    {
      day: "Thu",
      value: data.Thursday,
    },
    {
      day: "Fri",
      value: data.Friday,
    },
    {
      day: "Sat",
      value: data.Saturday,
    },
    {
      day: "Sun",
      value: data.Sunday,
    },
  ];
  daysArray.sort((a, b) => b.value - a.value);
  let heightValue = daysArray[0].value;
  const numberOfLineFromZero = 6;
  return (
    <div>
      <div className="flex my-4 items-center justify-between">
        <Typography
          textColor="text-black"
          textWeight="font-bold"
          textSize="text-[16px]"
        >
          {name}
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
          maxWidth={"max-w-[7.5rem]"}
          placeholder="Time Range"
          setValue={(data) => {}}
          bg={"bg-white"}
        />
      </div>
      <div className="relative">
        <div>
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              7
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              6
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              5
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              4
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              3
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              2
            }
          />
          <VendorCountLine
            value={
              Math.floor(((heightValue / numberOfLineFromZero) * 1) / 1000) *
              1000 *
              1
            }
          />

          <div className="mb-[1rem] lg:mb-0">
            {/* did this because of the slice */}
            <VendorCountLine value={0.001} />
          </div>
        </div>
        <div className="absolute right-0 bottom-[.6rem] lg:bottom-[9px]  w-[94%] h-[96%] flex justify-between pl-10">
          {daysArray.map((item, index) => {
            if (item.day == "Sun") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Mon") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Tue") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Wed") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Thu") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Fri") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
          {daysArray.map((item, index) => {
            if (item.day == "Sat") {
              return (
                <VerticalBar
                  heightValue={heightValue}
                  highest={item.value === heightValue ? true : false}
                  per={item.per}
                  value={item.value}
                  date={item.day}
                  key={index}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default VerticalBarGraph;
