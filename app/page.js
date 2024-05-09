"use client";
import { useState } from "react";

import Toast from "@/components/ToastComponent/toast";
// import Image from "next/image";
// import Button from "./components/Button";
// import Typography from "./components/Typography";
// import Badge from "./components/Badge";
// import FileUploadInput from "./components/FileUploadInput";
// import UploadSingleDocInput from "./components/UploadDocInput";
// import TextInput from "./components/TextInput";
// import ProgressBar from "./components/ProgressBar";
// import { useRouter } from "next/navigation";
// import PasswordInput from "./components/PasswordInput";
// import RadioInput from "./components/RadioInput";
// import PasswordValidate from "./components/PasswordValidation";
// import SideBar from "./components/SideBar";
// import DashboardTopCard from "./components/DashboardTopCard";
// import DonutChart from "./components/Chat/DoughnutChat";
// import ChatCard from "./components/Chat/ChatCard";
// import HorizontalChatBar from "./components/Chat/HorizontalChatBar";
// import HorizontalChat from "./components/Chat/HorizontalChart";
// import DasboardNavWithOutSearch from "./components/DashboardNavBarWithoutSearch";
// import DropDown from "./components/DropDown";
// import VendorCountLine from "./components/VendorCountLine";
// import VerticalBarGraph from "./components/VerticalBarGraph";
// import OrderStep from "./components/order/OrderStep";
// import SelectInput from "./components/SelectInput";
// import TextArea from "./components/TextAreaInput";
// import RejectOrderModal from "./components/order/RejectOrderModal";
// import Notification from "./components/Notification/NotificationComponent";
// import CheckBoxInput from "./components/CheckboxInput";
import toast from "react-hot-toast";
import DropDown from "@/components/DropDown";
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

  return (
    <main className="bg-white w-full h-[100vh] p-20">
      <h1
        className="cursor-pointer"
        onClick={() => {
          toast(<Toast text={"Hello man"} type="notify" />);
        }}
      >
        Homepage
      </h1>

      <h1>Components</h1>
      
    </main>
  );
}
