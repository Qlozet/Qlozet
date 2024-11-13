import Button from "@/components/Button";
import Design from "../CustomizeOrder/Design";
import Typography from "@/components/Typography";
import icon1 from "../../../public/assets/image/icon1.jpg";
import icon2 from "../../../public/assets/image/icon2.jpg";
import icon3 from "../../../public/assets/image/icon3.jpg";
import icon4 from "../../../public/assets/image/icon4.jpg";
import icon5 from "../../../public/assets/image/icon5.jpg";
import icon6 from "../../../public/assets/image/icon6.jpg";
import icon7 from "../../../public/assets/image/icon7.jpg";
import icon8 from "../../../public/assets/image/icon8.jpg";
import icon9 from "../../../public/assets/image/icon9.jpg";
import icon10 from "../../../public/assets/image/icon10.jpg";
import icon11 from "../../../public/assets/image/icon11.jpg";
import icon12 from "../../../public/assets/image/icon12.jpg";
import icon13 from "../../../public/assets/image/icon13.jpg";
import icon14 from "../../../public/assets/image/icon14.jpg";
import icon15 from "../../../public/assets/image/icon15.jpg";
import icon16 from "../../../public/assets/image/icon16.jpg";
import icon17 from "../../../public/assets/image/icon17.jpg";
import icon23 from "../../../public/assets/image/icon23.jpg";
import icon25 from "../../../public/assets/image/icon25.jpg";

const Dresses = ({ data }) => {
  return (
    <div className="w-full lg:w-[50%] bg-white px-5 rounded-b-[14px] min-h-[25rem]">
      <Typography
        textColor="text-dark"
        textWeight="font-[600]"
        textSize="text-[14px]"
      >
        Choose the customization options you'd like to present to your
        customers.
      </Typography>
      <div>
        <div className="grid grid-cols-auto-fill-minmax gap-4 py-4">
          {data.map((item, index) => (
            <Design
              image={item.imageUrl}
              key={index}
              id={item._id}
              name={item.class}
            />
          ))}

        </div>
      </div>
      <div>
        <div className="m-4">

        </div>
      </div>
    </div>
  );
};

export default Dresses;
