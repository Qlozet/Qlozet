import React, { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import moment from "moment";
import { putRequest } from "@/api/method";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import userIcon from "@/public/assets/image/user.png";
const ReviewItem = ({ review }) => {
  const [description, setDescription] = useState("");
  const [addReview, setAddReview] = useState(false);
  const [loading, setIsloading] = useState(false);
  const addReviewHandler = () => {
    setAddReview(!addReview);
  };

  const replyComment = async () => {
    try {
      setIsloading(true);
      const response = await putRequest(
        `/vendor/products/review/${review._id}`,
        { description: description }
      );
      response && setIsloading(false);
      if (response.code === 200) {
        toast(<Toast text={"Reply successful"} type="success" />);
      } else {
        toast(<Toast text={"An error occured"} type="danger" />);
      }
    } catch (error) {
      setIsloading(false);
    }
  };
  return (
    <div className="py-4 flex gap-[1rem]">
      <div className="border-[1px] border-solid border-primary w-[2.2rem] h-[2.1rem] rounded-[50%]">
        <Image
          src={userIcon}
          width={50}
          height={50}
          alt=""
          className="rounded-[50%]"
        />
      </div>
      <div className="w-[95%] mt-[0.5rem]">
        <div className="flex justify-between w-[100%]">
          <Typography
            children={review.user.fullName}
            textSize="text-xs"
          ></Typography>
          <Typography
            children={moment(review.updatedAt).format("DD/MM/YYYY")}
            textSize="text-xs"
          ></Typography>
        </div>
        <Typography
          textSize="text-xs"
          textWeight="font-medium"
          verticalPadding="py-4"
        >
          {review.description}
        </Typography>
        {!addReview && (
          <div className="flex items-center justify-end">
            <a
              className="underline text-[#5465FF] text-xs cursor-pointer"
              onClick={addReviewHandler}
            >
              Reply comment
            </a>
          </div>
        )}
        {addReview && (
          <div className="border-[1px] border-primary-100 border-solid flex rounded-md overflow-hidden">
            <input
              className="px-4 w-full  text-dark placeholder-gray-200 border-none outline-none text-xs"
              placeholder="Add review"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></input>
            <button
              className="bg-primary py-2 px-5 text-white text-xs"
              onClick={replyComment}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
