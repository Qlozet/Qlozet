"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/app/components/DashboardNavBarWithoutSearch";
import SideBar from "@/app/components/SideBar";
import SelectInput from "@/app/components/SelectInput";
import TextInput from "@/app/components/TextInput";
import Typography from "@/app/components/Typography";
import classes from "./index.module.css";
import Button from "@/app/components/Button";

const Support = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [showCompanyDetails, setShowComapanyDetails] = useState(false);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [currentNav, setCurrentNav] = useState("Company details");

  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Support" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Support"
          setValue={(data) => {
            // console.log(data);
          }}
        />
        <div className="min-h-[80vh]">
          <div className="mt-4 mx-auto ">
            <div className="bg-white rounded-[12px] w-[40%] m-auto px-4 py-6 my-6 shadow">
              <div>
                <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[14px]"
                  >
                    Add new warehouse
                  </Typography>
                  {/* <Image
                  src={closeIcon}
                  alt=""
                  onClick={closeModal}
                  className="cursor-pointer"
                /> */}
                </div>
                <TextInput
                  label="Phone number"
                  placeholder="Enter phone number"
                  setValue={(data) => {}}
                />
                <SelectInput
                  placeholder={"Select an option"}
                  // value={dropDownValue}
                  setValue={(data) => {
                    //   setDropDownValue(data);
                  }}
                  data={[
                    { text: "General inquiry" },
                    { text: "Pricing" },
                    { text: "Feature request" },
                    { text: "Bugs and issues" },
                    { text: "Others" },
                  ]}
                  label="User role"
                />
                <div className="my-6 flex items-center justify-end">
                  <Button
                    children="Add user"
                    btnSize="small"
                    minWidth="min-w-[14rem]"
                    variant="primary"
                    clickHandler={() => {
                      closeModal();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
