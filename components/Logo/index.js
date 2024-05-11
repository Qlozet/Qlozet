import Image from "next/image";
import logo from "../../public/assets/svg/logo.svg";
import logo2 from "../../public/assets/svg/altire2.svg";

const Logo = () => {
  return (
    <div>
      <div className=" items-center justify-center md:justify-start hidden md:flex">
        <Image src={logo} alt="" />
      </div>
      <div className=" items-center justify-center md:justify-start flex md:hidden">
        <Image src={logo2} alt="" />
      </div>
    </div>
  );
};

export default Logo;
