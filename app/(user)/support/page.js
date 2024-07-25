"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import SelectInput from "@/components/SelectInput";
import Typography from "@/components/Typography";
import classes from "./index.module.css";
import Button from "@/components/Button";
import MobileSideBar from "@/components/MobileSideBar";
import TextArea from "@/components/TextAreaInput";
import { postRequest } from "@/api/method";
import validator from "@/utils/validator";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
const Support = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [formData, setFormData] = useState({ issueType: "", message: "" });
  const [pageLoading, setPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiredFormData, setRequiredFormData] = useState({
    issueType: false,
    message: false,
  });
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const submiteHandler = async () => {
    const { status, data, id } = validator(formData, requiredFormData);
    if (status) {
      try {
        setIsLoading(true);
        const response = await postRequest("/vendor/support", {
          issueType: formData.issueType,
          message: formData.message,
        });

        console.log(response);
        if (response.data) {
          setFormData({ message: "", issueType: "" });
          toast(<Toast text={response?.message} type="success" />);
        }
      } catch (error) {}
    } else {
      setRequiredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };
  return (
    <section className="ml-[260px]">
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Support" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Support"
              closeSideBar={showSideBar}
            />
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
                <div className="bg-white rounded-[12px] w-full  lg:w-[40%] m-auto px-4 py-6 my-6 shadow">
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
                      placeholder={"User type "}
                      value={formData.issueType}
                      setValue={(data) => {
                        setFormData((prevData) => {
                          return { ...prevData, issueType: data };
                        });
                        if (data) {
                          setRequiredFormData((prevData) => {
                            return { ...prevData, issueType: false };
                          });
                        } else {
                          setRequiredFormData((prevData) => {
                            return { ...prevData, issueType: true };
                          });
                        }
                      }}
                      data={[
                        { text: "General Inquiry" },
                        { text: "Pricing" },
                        { text: "Feature Request" },
                        { text: "Bugs and Issues" },
                        { text: "Others" },
                      ]}
                      label="User type"
                      error={requiredFormData.issueType}
                    />
                    <TextArea
                      label="Message"
                      placeholder="Give a summary of the problem you are presently encountering."
                      setValue={(data) => {
                        setFormData((prevData) => {
                          return { ...prevData, message: data };
                        });
                        // if (data) {
                        //   setRequiredFormData((prevData) => {
                        //     return { ...prevData, issueType: false };
                        //   });
                        // } else {
                        //   setRequiredFormData((prevData) => {
                        //     return { ...prevData, issueType: true };
                        //   });
                        // }
                      }}
                      error={requiredFormData.message}
                      value={formData.message}
                    />
                    <div className="my-8 flex items-center justify-center lg:justify-end ">
                      <Button
                        loading={isLoading}
                        children="Submit"
                        btnSize="small"
                        minWidth="min-w-[14rem]"
                        variant="primary"
                        clickHandler={() => {
                          submiteHandler();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Support;
