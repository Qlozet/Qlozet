import Image from "next/image";
import logo from "../../public/assets/svg/logo.svg";
const Logo = () => {
  return (
    <div className="flex items-center justify-center md:justify-start">
      <Image src={logo} alt="" />
    </div>
  );
};

export default Logo;
