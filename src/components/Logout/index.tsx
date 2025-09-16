import React from "react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from '@/lib/routes';
import Image from "next/image";
import Typography from "../Typography";
import Button from "../Button";
import { clearToken } from "@/utils/localstorage";
import questionMarkIcon from "@/public/assets/svg/question-mark 1.svg";
import closeIcon from "@/public/assets/svg/close-square.svg";

interface LogoutProps {
  logoutFunction: () => void;
}

const Logout: React.FC<LogoutProps> = ({ logoutFunction }) => {
  const router = useRouter();

  const handleCloseClick = (): void => {
    logoutFunction();
  };

  const handleContinueClick = (): void => {
    router.push(AUTH_ROUTES.signin);
    clearToken() && logoutFunction();
  };

  return (
    <div className="relative bg-white w-full lg:w-[35%] rounded-[12px] flex flex-col items-center gap-6 p-6">
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={handleCloseClick}
      >
        <Image src={closeIcon} alt="Close icon" />
      </div>
      <Image src={questionMarkIcon} alt="Question mark icon" />
      <Typography
        textColor="text-black"
        textWeight="font-bold"
        textSize="text-[18px]"
      >
        Are you sure you want to logout?
      </Typography>
      <Button
        children="Continue"
        btnSize="large"
        variant="danger"
        clickHandler={handleContinueClick}
      />
    </div>
  );
};

export default Logout;
