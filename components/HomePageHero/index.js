import Image from "next/image";
import firstImage from "../../public/assets/image/homeImage.jpg";
import SecondImag from "../../public/assets/image/SecondImag.jpg";
import third from "../../public/assets/image/third.jpg";
import fourth from "../../public/assets/image/fourth.jpg";
import fift from "../../public/assets/image/fourth-hero.jpg";
import sixt from "../../public/assets/svg/sixth.svg";
import Typography from "../Typography";
import Button from "../Button";
const HomePageHero = () => {
  return (
    <div className="bg-[#8A8989]  mt-4 rounded-[12px]">
      <div className="flex p-4">
        <div className="flex-1 mt-[64px] ml-[32px]">
          <div>
            <Typography
              textColor="text-white"
              textWeight="font-[500]"
              textSize="text-[54px]"
            >
              Welcome to Altire
            </Typography>
            <Typography
              textColor="text-white"
              textWeight="font-[400]"
              textSize="text-[24px]"
            >
              We are the driving force behind the dreams of emerging designers
              and tailors entrepreneurs{" "}
            </Typography>
            <div className="mt-[43px]">
              <Button
                loading={false}
                children="Sell with Us"
                btnSize="large"
                variant="primary"
                maxWidth="max-w-[10rem]"
                clickHandler={() => {
                  //   handleSubmit();
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-end gap-[32]">
          <div>
            <Image
              src={SecondImag}
              alt=""
              unoptimized
              className="rounded-[8px] translate-x-[-20px] border-solid border-[2px] border-primary"
            />
          </div>
          <div>
            <Image
              src={firstImage}
              alt=""
              unoptimized
              className="rounded-[8px]"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 w-full overflow-hidden">
        <Image
          src={third}
          className="rounded-tl-[20px] rounded-tr-[20px] w-full"
          unoptimized
        />
        <Image
          src={fourth}
          className="rounded-tl-[20px] rounded-tr-[20px] w-full"
          unoptimized
        />
        <div className="relative z-10"></div>
       
        <Image
          src={sixt}
          className="rounded-tl-[20px] rounded-tr-[20px] w-full"
          unoptimized
        />
      </div>
    </div>
  );
};

export default HomePageHero;
