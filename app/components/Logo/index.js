import Image from "next/image";
import logo from "../../../public/assets/svg/logo.svg";
const Logo = () => {
  return (
    <div className="inline">
      <Image src={logo} alt="" />
    </div>
  );
};

export default Logo;
