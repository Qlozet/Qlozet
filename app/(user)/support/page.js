"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import SelectInput from "@/components/SelectInput";
import TextInput from "@/components/TextInput";
import Typography from "@/components/Typography";
import classes from "./index.module.css";
import Button from "@/components/Button";
import MobileSideBar from "@/components/MobileSideBar";
import TextArea from "@/components/TextAreaInput";

const Support = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [showCompanyDetails, setShowComapanyDetails] = useState(false);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Support" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Support" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Support"
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
        />
        <div className="min-h-[80vh]">
          <div className="mt-4 mx-auto ">
            <div className="bg-white rounded-[12px] w-full  md:w-[40%] m-auto px-4 py-6 my-6 shadow">
              <div>
                <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[14px]"
                  >
                    Get support
                  </Typography>
                  {/* <Image
                  src={closeIcon}
                  alt=""
                  onClick={closeModal}
                  className="cursor-pointer"
                /> */}
                </div>

                <SelectInput
                  placeholder={"Issue type "}
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
                <TextArea
                  label="Message"
                  placeholder="Give a summary of the problem you are presently encountering."
                  setValue={(data) => {}}
                />
                <div className="my-6 flex items-center justify-center md:justify-end ">
                  <Button
                    children="Submit"
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
