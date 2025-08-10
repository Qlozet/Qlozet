import React from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import style from "./index.module.css";
import brownLogo from "../../public/assets/image/logowhite.png";
import Button from "../Button";

const HomePageHeader: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-full mx-auto flex items-center justify-between px-4 lg:px-[87.5px] py-8">
      <Image src={brownLogo} alt="Logo" width={83} height={50} priority />
      <ul
        className={`${style.list_container} hidden lg:flex gap-[3rem] items-center text-white font-semibold text-[13px] `}
      >
        <li>What we do</li>
        <li>Services</li>
        <li>Pricing</li>
        <li>How it works</li>
        <li>About us</li>
      </ul>

      <div>
        <Button
          loading={false}
          children="Signin / signup"
          btnSize="small" // Changed from large to small to better fit header
          variant="outline"
          className="bg-white w-[144px] text-xs font-extrabold"
          clickHandler={() => {
            router.push("/auth/signin");
          }}
        />
      </div>
    </div>
  );
};

export default HomePageHeader;