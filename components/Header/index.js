import style from "./index.module.css";
import Image from "next/image";
import Button from "../Button";
import brownLogo from "../../public/assets/image/logobrown.png";
const HomePageHeader = () => {
  return (
    <div className="w-[95%] mx-auto">
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
          <Button
            loading={false}
            children="Watch demo"
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
  );
};

export default HomePageHeader;
