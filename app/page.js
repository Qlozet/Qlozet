"use client";
import Image from "next/image";
import Button from "./components/Button";
import Typography from "./components/Typography";
import Badge from "./components/Badge";
import FileUploadInput from "./components/FileUploadInput";
import UploadSingleDocInput from "./components/UploadSingleDocInput";
import TextInput from "./components/TextInput";
import ProgressBar from "./components/ProgressBar";
import { useRouter } from "next/navigation";
import PasswordInput from "./components/PasswordInput";
import RadioInput from "./components/RadioInput";
import PasswordValidate from "./components/PasswordValidation";
import SideBar from "./components/SideBar";
import DashboardTopCard from "./components/DashboardTopCard";
import DonutChart from "./components/Chat/DoughnutChat";
import ChatCard from "./components/Chat/ChatCard";
import HorizontalChatBar from "./components/Chat/HorizontalChatBar";
import HorizontalChat from "./components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "./components/DashboardNavBarWithoutSearch";
import DropDown from "./components/DropDown";
import { useState } from "react";
import VendorCountLine from "./components/VendorCountLine";
import VerticalBarGraph from "./components/VerticalBarGraph";
import OrderStep from "./components/order/OrderStep";
import SelectInput from "./components/SelectInput";
import TextArea from "./components/TextAreaInput";
import RejectOrderModal from "./components/order/RejectOrderModal";
import Notification from "./components/Notification/NotificationComponent";
export default function Home() {
  const [dropDownValue, setDropDownValue] = useState("");

  const data = [
    {
      location: "Warri",
      total: "w-[70%]",
      percentage: "w-[50%]",
    },
    {
      location: "Benin",
      total: "w-[60%]",
      percentage: "w-[53%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
  ];
  const chartData = {
    labels: ["Male", "Female"],
    values: [12, 19],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };

  const dropdownData = [
    {
      text: "View vendor’s details",
      color: "",
    },
    {
      text: "View vendor’s ",
      color: "",
    },
    {
      text: "vendor’s details",
      color: "",
    },
  ];

  const router = useRouter();
  return (
    <main className="bg-white w-full h-[100vh] p-20">
      {/* 
      <Typography textColor="text-black" textSize="text-[46px]">
        Hello
      </Typography>
      <Badge variant="danger"> Successful</Badge>
      <FileUploadInput></FileUploadInput>
      <TextInput
        label={"Business name "}
        placeholder={"Enter your business name"}
        disabled={false}
      />
      <ProgressBar step={6} />
      <UploadSingleDocInput></UploadSingleDocInput> */}
      {/* <PasswordValidate text="sdfsdsjsdjj" checked={false} /> */}
      {/* remove the number fron the value and convert it to string */}
      <h1>Homepage</h1>

      <Button
        variant="outline"
        btnSize="small"
        disabled={false}
        clickHandler={() => {
          router.push(`auth/signup`);
        }}
      >
        Veiw Signup
      </Button>
      <h1>Components</h1>
      <div className="relative z-10">
        {" "}
        {/* <SelectInput
          placeholder={"Vendor’s status"}
          value={dropDownValue}
          setValue={(data) => {
            setDropDownValue(data);
          }}
          data={dropdownData}
          label="Why are you rejecting this order"
        /> */}
        <TextArea
          placeholder="Tell us the reason you’re rejecting this order"
          label="Enter a reason"
        />
        <RejectOrderModal />
      </div>

      <div className="">
        <OrderStep step={6} />
      </div>

      <VerticalBarGraph />

      {/* <VendorStatus
        text="Awaiting verification"
        bgColor="bg-[#33CC331A]"
        color="text-[#33CC33]"
      />
      <DropDown
        placeholder={"Vendor’s status"}
        value={dropDownValue}
        setValue={(data) => {
          setDropDownValue(data);
        }}
        data={dropdownData}
      />
      <DasboardNavWithOutSearch
        addSearch={true}
        setValue={(data) => {
          console.log(data);
        }}
      /> */}
      {/* <HorizontalChat /> */}
      {/* <ChatCard
        text="Orders by gender"
        graph={<DonutChart data={chartData} />}
      />
      <ChatCard
        text="Orders by product"
        graph={<HorizontalChat data={data} />}
      />
      <ChatCard
        text="Orders by top location"
        graph={<HorizontalChat data={data} />}
      />
      <SideBar active="Dashboard" />
      <DashboardTopCard
        name="Total Orders"
        total="10000"
        percentage="2.5"
        bgColor="bg-[#57CAEB]"
        link="link"
      /> */}
    </main>
  );
}
