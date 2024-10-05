import style from "./index.module.css";
import Image from "next/image";
import Button from "../Button";
import brownLogo from "../../public/assets/image/logobrown.png";
const HomePageHeader = () => {
  return (
    <div className="w-[95%] mx-auto py-6">
      <div className="flex items-center justify-between ">
        <Image
          src={brownLogo}
          alt=""
          style={{
            width: "100px",
            height: "auto",
          }}
        />
        <div className="flex items-center gap-[3rem]">
          <ul
            className={`${style.list_container} flex gap-[3rem] items-center`}
          >
            <div className="min-w-[6rem]">What we do</div>
            <li>Services</li>
            <li>Pricing</li>
            <li>Api</li>
            <li className="min-w-[7rem]">How it works</li>
          </ul>
          {/* <Button
            loading={false}
            children="Watch demo"
            btnSize="large"
            variant="primary"
            maxWidth="max-w-[10rem]"
            clickHandler={() => {
              //   handleSubmit();
            }}
          /> */}
          <button  className="px-4 py-2 rounded-sm bg-dark flex items-center h-[2.8rem] text-white ">Watch demo</button>
        </div>
      </div>
    </div>
  );
};

export default HomePageHeader;
