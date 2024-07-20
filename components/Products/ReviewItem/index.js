import React, { useState } from "react";
import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "@/components/Typography";

const ReviewItem = ({}) => {
  const [addReview, setAddReview] = useState(false);
  const addReviewHandler = () => {
    setAddReview(!addReview);
  };
  return (
    <div className="py-4 flex gap-[1rem]">
      <div className="border-[1px] border-solid border-primary w-[2.2rem] h-[2.1rem] rounded-[50%]">
        <Image src={closeIcon} width={50} height={50}  alt=""/>
      </div>
      <div className="w-[95%] mt-[0.5rem]">
        <div className="flex justify-between w-[100%]">
          <Typography
            children="Jasime King"
            textSize="text-[12px]"
          ></Typography>
          <Typography children="14/02/2023" textSize="text-[12px]"></Typography>
        </div>
        <Typography
          textSize="text-[12px]"
          textWeight="font-[500]"
          verticalPadding="py-4"
        >
          Great dress, it loved it, my order got delivered to me early and the
          dress fits perfectly. I will order more
        </Typography>
        {!addReview && (
          <div className="flex items-center justify-end">
            <a
              className="underline text-[#5465FF] text-[12px] cursor-pointer"
              onClick={addReviewHandler}
            >
              Reply comment
            </a>
          </div>
        )}
        {addReview && (
          <div className="border-[1px] border-primary-100 border-solid flex rounded-[6px] overflow-hidden">
            <input
              className="px-4 w-full  text-dark placeholder-gray-200 border-none outline-none text-[12px]"
              placeholder="Add review"
            ></input>
            <button
              className="bg-primary py-2 px-5 text-white text-[12px]"
              onClick={addReviewHandler}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
