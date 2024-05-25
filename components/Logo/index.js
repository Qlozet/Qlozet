import Image from "next/image";
import logo from "../../public/assets/svg/logo.svg";
import logo2 from "../../public/assets/svg/altire2.svg";

const Logo = () => {
  return (
    <div>
      <div className=" items-center justify-center lg:justify-start hidden lg:flex">
        <Image src={logo} alt="" />
      </div>
      <div className="items-center justify-center lg:justify-start flex lg:hidden">
        <Image src={logo2} alt="" />
      </div>
    </div>
  );
};

export default Logo;
