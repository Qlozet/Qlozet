import Image from "next/image";
import frame1 from '../../public/assets/svg/frame1.svg'
import frame2 from '../../public/assets/svg/frame2.svg'
import frame3 from '../../public/assets/svg/frame3.svg'
import frame4 from '../../public/assets/svg/frame4.svg'
import frame5 from '../../public/assets/svg/frame5.svg'
import frame6 from '../../public/assets/svg/frame6.svg'
import Typography from "../Typography";
import backgroungImage from '../../public/assets/image/frame.jpg'
import Button from "../Button";
const HomePageHero = () => {
  return (
    <div className={` mt-4 rounded-[12px] w-[95%] mx-auto`} style={{
      backgroundImage: `url('https://res.cloudinary.com/dxqg5hify/image/upload/v1728076899/f05c5b09b12e674c3e031d5f2ea52b06_vflqev.jpg')`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover"
    }}>
      <div className="flex px-4 gap-8">
        <div className="flex-1 flex-col justify-between w-[80%] pt-4 min-h-full">
          <div className="ml-12 mt-[4rem] w-[65%]">
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
              and tailors entrepreneurs
            </Typography>
            <div className="mt-[43px]">
              <button className="px-4 py-2 rounded-2xl bg-dark flex items-center h-[2.8rem] text-white ">Sell with Us</button>
            </div>
          </div>
          <div className="">
            <div className="flex items-center justify-end"><Image alt="" src={frame3} /></div>
            <div className="flex items-end justify-between gap-2 w-[100%]">
              <Image alt="" src={frame6} />
              <Image alt="" src={frame5} />
              <Image alt="" src={frame4} />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[20%] justify-end gap-[3rem] pt-12 min-h-full">
          <Image alt="" src={frame1} unoptimized />
          <div className="flex items-end"><Image alt="" src={frame2} unoptimized /></div>
        </div>
      </div>

    </div>
  );
};

export default HomePageHero;
