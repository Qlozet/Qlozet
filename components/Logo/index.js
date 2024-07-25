import Image from "next/image";
import brownLogo from "../../public/assets/image/logobrown.png";
import whiteLogo from "../../public/assets/image/logowhite.png";

const Logo = () => {
  return (
    <div>
      <div className=" items-center justify-center lg:justify-start hidden lg:flex">
        <Image
          src={brownLogo}
          alt=""
          style={{
            width: "100px",
            height: "auto",
          }}
        />
      </div>
      <div className="items-center justify-center lg:justify-start flex lg:hidden">
        <Image
          src={whiteLogo}
          alt=""
          style={{
            width: "100px",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
};

export default Logo;
