import Typography from "../Typography";
import closeIcon from "../../public/assets/svg/close-square-icon.svg";
import userIcon from "../../public/assets/svg/Frame.svg";
import rotate from "../../public/assets/svg/rotate-icon.svg";
import Image from "next/image";
import Performance from "../Performance";
import Rating from "../Rating";
import styles from "./index.module.css";
import { useEffect, useState, useRef } from "react";
import mobileProfile from "../../public/assets/svg/mobile-oct-icon.svg";
const Profile = ({ userDetails, showProfile, showProfileHandler }) => {
  const outsideRef = useRef();
  const profileRef = useRef();
  // const showProfileHandler = () => {
  //   console.log("clicked in");
  //   setShowProfile(true);
  // };
  console.log(userDetails);
  const clickOutSide = (e) => {
    if (e.target !== profileRef.current) {
      showProfileHandler();
    }
  };
  return (
    <div>
      <div>
        <div
          className={`fixed h-screen w-screen top-0 right-0 flex justify-end z-50 ${styles.container}`}
        >
          {showProfile && (
            <div
              style={{ backgroundColor: "rgba(0,0,0,.3)" }}
              className="w-full"
              onClick={clickOutSide}
              ref={outsideRef}
            ></div>
          )}

          <div className="relative">
            {showProfile && (
              <div
                className="w-screen  bg-white  lg:w-[350px] "
                ref={profileRef}
              >
                <div className="bg-white">
                  <div>
                    <div className="flex px-4 py-6 items-center justify-between">
                      <Typography
                        textColor="text-primary"
                        textWeight="font-bold"
                        textSize="text-[18px]"
                      >
                        Profile
                      </Typography>
                      <Image
                        src={closeIcon}
                        alt=""
                        onClick={showProfileHandler}
                        className="cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="items-center justify-center">
                        <Image
                          src={userDetails.profileImage}
                          width={30}
                          height={30}
                          style={{
                            width: "5rem",
                            height: "5rem",
                          }}
                          alt=""
                          className="my-2 mx-auto rounded-[50%]"
                        />
                        <div className="p-1 flex justify-center items-center">
                          <Typography
                            textColor="text-primary"
                            textWeight="font-bold"
                            textSize="text-[18px]"
                          >
                            {userDetails.personalName}
                          </Typography>
                        </div>
                        <div className="flex justify-center items-center">
                          <Typography
                            textColor="text-primary"
                            textWeight="font-normal"
                            textSize="text-[16px]"
                          >
                            {userDetails.businessName}
                          </Typography>
                        </div>
                        <div className="border-b-[1px] border-solid border-gray-100 mx-4">
                          <div className="flex items-center justify-between  px-6 py-6 w-[65%] mx-auto">
                            <div className="flex flex-col items-center justify-center ">
                              <Typography
                                textColor="text-primary"
                                textWeight="font-normal"
                                textSize="text-[12px]"
                                align="center"
                              >
                                items
                              </Typography>
                              <Typography
                                textColor="text-primary"
                                textWeight="font-bold"
                                textSize="text-[18px]"
                                align="center"
                              >
                                {userDetails.items}
                              </Typography>
                            </div>
                            <div className="h-[2rem] w-[1px] bg-gray-200"></div>
                            <div className="flex flex-col items-center justify-center">
                              <Typography
                                textColor="text-primary"
                                textWeight="font-normal"
                                textSize="text-[12px]"
                                align="center"
                              >
                                Profit
                              </Typography>
                              <Typography
                                textColor="text-primary"
                                textWeight="font-bold"
                                textSize="text-[18px]"
                                align="center"
                              >
                                {userDetails.profit.toLocaleString()}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <Typography
                        textColor="text-primary"
                        textWeight="font-bold"
                        textSize="text-[18px]"
                      >
                        Customers Reviews
                      </Typography>
                      <Image src={rotate} alt="" />
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2">
                      <Rating newRating={parseInt(userDetails.averageRating)} />
                      <div className="flex items-center">
                        <div className="mr-2">
                          <Typography
                            textColor="text-primary"
                            textWeight="font-[600]"
                            textSize="text-[18px]"
                          >
                            {userDetails.averageRating}
                          </Typography>
                        </div>
                        <Typography
                          textColor="text-primary"
                          textWeight="font-normal"
                          textSize="text-[12px]"
                        >
                          Out of 5 star
                        </Typography>
                      </div>
                    </div>
                    <div className="pl-4">
                      <Typography
                        textColor="text-primary"
                        textWeight="font-normal"
                        textSize="text-[12px]"
                      >
                        Overall rating of 100 customer’s reviews
                      </Typography>
                    </div>
                    <div className="m-4 border-b-[2px] border-solid border-gray-200 pb-8">
                      <Performance
                        name="Excellence"
                        value={userDetails.ratings.excellent * 10}
                        color={"bg-primary"}
                      />
                      <Performance
                        name="Good"
                        value={userDetails.ratings.good * 10}
                        color={"bg-primary-100"}
                      />
                      <Performance
                        name="Average"
                        value={userDetails.ratings.average * 10}
                        color={"bg-primary-200"}
                      />

                      <Performance
                        name="Avg. Below"
                        value={userDetails.ratings.belowAverage * 10}
                        color={"bg-primary-300"}
                      />
                      <Performance
                        name="Poor"
                        value={userDetails.ratings.poor * 10}
                        color={"bg-gray-100"}
                      />
                    </div>
                    {/* <div className="flex items-center justify-between p-4">
              <Typography
                textColor="text-primary"
                textWeight="font-bold"
                textSize="text-[18px]"
              >
                Task Last Month
              </Typography>
              <Image src={rotate} alt="" />
            </div>
            <div className="px-4 flex gap-4 items-center ">
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                  <div className="w-[5px] h-[5px] bg-success-100 rounded-[50%]"></div>
                </div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-normal"
                  textSize="text-[12px]"
                >
                  All
                </Typography>
              </div>
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                  <div className="w-[5px] h-[5px] bg-gray-200 rounded-[50%]"></div>
                </div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-normal"
                  textSize="text-[12px]"
                >
                  Delivered
                </Typography>
              </div>
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                  <div className="w-[5px] h-[5px] bg-gray-200 rounded-[50%]"></div>
                </div>
                <Typography
                  textColor="text-primary"
                  textWeight="font-normal"
                  textSize="text-[12px]"
                >
                  Order
                </Typography>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between p-4">
                <Typography
                  textColor="text-primary"
                  textWeight="font-[300]"
                  textSize="text-[14px]"
                >
                  #New Category add
                </Typography>
                <Typography
                  textColor="text-primary"
                  textWeight="font-normal"
                  textSize="text-[14px]"
                >
                  Last Week
                </Typography>
              </div>
              <div className="my-4">
                {" "}
                <div className="flex items-center justify-between p-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[16px]"
                  >
                    Restock New kaftan products
                  </Typography>
                  <Typography
                    textColor="text-primary"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    5d ago
                  </Typography>
                </div>{" "}
                <div className="flex items-center justify-between p-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[16px]"
                  >
                    Restock New kaftan products
                  </Typography>
                  <Typography
                    textColor="text-primary"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    5d ago
                  </Typography>
                </div>{" "}
                <div className="flex items-center justify-between p-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[16px]"
                  >
                    Restock New kaftan products
                  </Typography>
                  <Typography
                    textColor="text-primary"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    5d ago
                  </Typography>
                </div>{" "}
                <div className="flex items-center justify-between p-4">
                  <Typography
                    textColor="text-primary"
                    textWeight="font-bold"
                    textSize="text-[16px]"
                  >
                    Restock New kaftan products
                  </Typography>
                  <Typography
                    textColor="text-primary"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    5d ago
                  </Typography>
                </div>
              </div>
            </div> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
