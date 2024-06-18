"use client";
import { useEffect, useState } from "react";

import Toast from "@/components/ToastComponent/toast";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DropDown from "@/components/DropDown";
export default function Home() {
  const router = useRouter();

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

  useEffect(() => {
    router.push("/auth/signin");
  }, []);

  return (
    <main className="bg-white w-full h-[100vh] p-20">
      <h1
        className="cursor-pointer"
        onClick={() => {
          toast(<Toast text={"gdfgdggdgggghdhjjdHello man"} type="success" />);
        }}
      >
        Homepage
      </h1>
      <h1>Components</h1>
    </main>
  );
}
