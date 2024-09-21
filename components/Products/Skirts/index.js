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

const customization = [
  { id: 1, image: icon1 },
  { id: 2, image: icon2 },
  { id: 3, image: icon3 },
  { id: 4, image: icon4 },
  { id: 5, image: icon5 },
  { id: 6, image: icon6 },
  { id: 7, image: icon7 },
  { id: 8, image: icon8 },
  { id: 9, image: icon9 },
  { id: 10, image: icon10 },
  { id: 11, image: icon11 },
  { id: 12, image: icon12 },
  { id: 13, image: icon13 },
  { id: 14, image: icon14 },
  { id: 15, image: icon15 },
  { id: 16, image: icon16 },
  { id: 17, image: icon17 },
];

const Skirts = ({ data }) => {
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
        <div className="grid grid-cols-3 lg:grid-cols-8 gap-4 py-4 mt-1"></div>
        <div className="m-4">
          {/* <Button
            maxWidth="max-w-[6rem]"
            children="Submit"
            btnSize="large"
            variant="primary"
            clickHandler={() => {}}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Skirts;
