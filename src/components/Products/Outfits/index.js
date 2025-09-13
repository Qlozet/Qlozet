import Button from "@/components/Button";
import Design from "../CustomizeOrder/Design";
import Typography from "@/components/Typography";
import icon1 from "@/public/assets/image/icon1.jpg";
import icon2 from "@/public/assets/image/icon2.jpg";
import icon3 from "@/public/assets/image/icon3.jpg";
import icon4 from "@/public/assets/image/icon4.jpg";
import icon5 from "@/public/assets/image/icon5.jpg";
import icon6 from "@/public/assets/image/icon6.jpg";
import icon7 from "@/public/assets/image/icon7.jpg";
import icon8 from "@/public/assets/image/icon8.jpg";
import icon9 from "@/public/assets/image/icon9.jpg";
import icon10 from "@/public/assets/image/icon10.jpg";
import icon11 from "@/public/assets/image/icon11.jpg";
import icon12 from "@/public/assets/image/icon12.jpg";
import icon13 from "@/public/assets/image/icon13.jpg";
import icon14 from "@/public/assets/image/icon14.jpg";
import icon15 from "@/public/assets/image/icon15.jpg";
import icon16 from "@/public/assets/image/icon16.jpg";
import icon17 from "@/public/assets/image/icon17.jpg";

const Outfits = ({ data }) => {
  return (
    <div className="w-full lg:w-[50%] bg-white px-5 rounded-b-[14px] min-h-[25rem]">
      <Typography
        textColor="text-dark"
        textWeight="font-[600]"
        textSize="text-sm"
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
          {/* <Design image={icon1} />
          <Design image={icon2} />
          <Design image={icon3} />
          <Design image={icon4} />
          <Design image={icon5} /> */}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 lg:grid-cols-8 gap-4 py-4 mt-1">
          {/* <Design image={icon6} reduce={true} />
          <Design image={icon7} reduce={true} />
          <Design image={icon8} reduce={true} />
          <Design image={icon9} reduce={true} />
          <Design image={icon10} reduce={true} />
          <Design image={icon11} reduce={true} />
          <Design image={icon12} reduce={true} />
          <Design image={icon13} reduce={true} />
          <Design image={icon14} reduce={true} />
          <Design image={icon15} reduce={true} />
          <Design image={icon16} reduce={true} />
          <Design image={icon17} reduce={true} />
          <Design image={icon3} reduce={true} /> */}
        </div>
        <div className="m-4">
          {/* <Button
            // loading={isLoading}
            maxWidth="max-w-[6rem]"
            children="Submit"
            btnSize="large"
            variant="primary"
            clickHandler={() => {
              // handleLogin();
            }}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Outfits;
