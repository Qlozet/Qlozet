"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import OrderDetailNav from "@/components/order/OrderdetailsNav";
import Modal from "@/components/Modal";
import classes from "./index.module.css";
import UserAndPermission from "@/components/Settings/UserAndPermission/UserAndPermssion";
import Category from "@/components/Settings/Category/Category";
import MobileSideBar from "@/components/MobileSideBar";
import NumberInput from "@/components/NumberInput";
import CheckBoxInput from "@/components/CheckboxInput";
import TextInput from "@/components/TextInput";
import TextArea from "@/components/TextAreaInput";
import Button from "@/components/Button";
import DashedComponent from "@/components/DashedComponent";
import SelectInput from "@/components/SelectInput";
import ColorInput from "@/components/ColorInput";
import FileInput from "@/components/uploadFileinput/UploadFileInput";
import Quantity from "@/components/Quantity";
import Typography from "@/components/Typography";
import CustomiSationButton from "@/components/CustomizationButton";
import CustomizeOrder from "@/components/Products/CustomizeOrder";

const AddProduct = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [showCustomiseOrder, setShowCustomiseOrder] = useState(true);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [currentNav, setCurrentNav] = useState("Shop details");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const closeModal = () => {
    setCustomerDetails(false);
    setShowHistory(false);
  };

  const topNavData = [
    {
      item: "Tops",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Bottoms",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Dresses",
      navWidth: "min-w-[8rem] md:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Outfits",
      link: "",
      navWidth: "min-w-[10rem] md:min-w-w-[0]",
      handleFunction: (data) => {},
    },
    {
      item: "Skirts",
      link: "",
      navWidth: "min-w-[13rem] md:min-w-w-[0]",
      handleFunction: (data) => {
       
      },
    },
  
  ];

  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Products" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Dashboard" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Products"
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
        />
        <div className="mt-4"></div>
        <div className="">
          <div className="mx-0 bg-gray-300 md:bg-white p-4  rounded-t-lg md:translate-x-2">
            <CheckBoxInput label="Billing address same as company details" />
          </div>
          <div className="bg-white w-full p-4 mx-0 md:mx-2">
            <DashedComponent name={"Product info"} />
            <div className="block md:flex items-center justify-between  gap-6">
              <div className="w-full">
                <TextInput
                  label="Product name"
                  placeholder="Enter product name"
                  setValue={(data) => {}}
                />{" "}
              </div>
              <div className="w-full">
                <TextInput
                  label="Price"
                  placeholder="Enter price"
                  setValue={(data) => {}}
                />
              </div>
              <div className="w-full">
                <SelectInput
                  placeholder={"Tags"}
                  // value={dropDownValue}
                  setValue={(data) => {
                    //   setDropDownValue(data);
                  }}
                  data={[{ text: "Male" }, { text: "Female" }]}
                  label="Enter tags"
                />
              </div>
            </div>
            <div className="block md:flex items-center justify-between  gap-6">
              <div className="w-full">
                <SelectInput
                  placeholder={"Category"}
                  // value={dropDownValue}
                  setValue={(data) => {
                    //   setDropDownValue(data);
                  }}
                  data={[{ text: "Two Piece" }, { text: "Dress" }]}
                  label="Enter category"
                />
              </div>
              <div className="w-full">
                <SelectInput
                  placeholder={"Enter product type"}
                  // value={dropDownValue}
                  setValue={(data) => {
                    //   setDropDownValue(data);
                  }}
                  data={[{ text: "Customizable" }, { text: "Outright" }]}
                  label="Product type"
                />
              </div>
              <div className="w-full">
                <ColorInput
                  label="Colour"
                  placeholder="Choose  colours available for this product"
                  setValue={(data) => {}}
                />
              </div>
            </div>
            <div className="block md:flex  justify-between  gap-6">
              <div className="w-full">
                <FileInput
                  label="Upload product image"
                  // placeholder="Enter NIN"
                  setValue={(data) => {}}
                />
              </div>
              <div className="w-full">
                <FileInput
                  label="Product description"
                  // placeholder="Enter NIN"
                  setValue={(data) => {}}
                />
              </div>
              <div className="w-full flex items-start justify-start">
                <TextInput
                  label="Available discount?"
                  placeholder="Enter available discount?"
                  setValue={(data) => {}}
                />
              </div>
            </div>
            <div className="block md:flex items-center justify-between gap-6">
              <div className="w-[32%]">
                <Quantity
                  label="Available quantity"
                  placeholder="Enter available quantity"
                  setValue={(data) => {}}
                />
              </div>
            </div>

            <div className="my-4">
              <DashedComponent name={"Customization"} />
            </div>

            <div>
              {" "}
              <div className="">
                <Typography
                  textWeight="font-[700]"
                  textSize="text-[18px]"
                  verticalPadding="my-2"
                  textColor="text-dark"
                >
                  Add Customization
                </Typography>
              </div>
            </div>
            <div>
              <CustomiSationButton />
            </div>
            <div className="my-4">
              <Button
                children="Save"
                btnSize="large"
                variant="primary"
                maxWidth="max-w-[10rem]"
                clickHandler={() => {
                  // setStep(step + 1);
                }}
              />
            </div>
          </div>
        </div>
        {showCustomiseOrder && (
          <Modal
            content={
              <CustomizeOrder topNavData={topNavData} closeModal={closeModal} />
            }
          ></Modal>
        )}
        {/* {currentNav === "Shop details" && <CompanyDetails />}
        {currentNav === "Billing and invoice" && <BillingAndInvioce />}
        {currentNav === "Warehouses" && <Warehouse />}
        {currentNav === "Shipping partners" && <Shipping />}
        {currentNav === "Users and permissions" && <UserAndPermission />}
        {currentNav === "Categories" && <Category />} */}
      </div>
    </div>
  );
};

export default AddProduct;
