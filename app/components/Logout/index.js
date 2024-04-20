import questionMarkIcon from "../../../public/assets/svg/question-mark 1.svg";
import closeIcon from "../../../public/assets/svg/close-square.svg";
import Typography from "../Typography";
import Button from "../Button";
import Image from "next/image";
const Logout = ({ logoutFunction }) => {
  return (
    <div className="relative bg-white w-[35%] rounded-[12px] flex flex-col items-center gap-6 p-6">
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => {
          logoutFunction();
        }}
      >
        <Image src={closeIcon} alt="" />
      </div>
      <Image src={questionMarkIcon} alt="" />
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
        clickHandler={() => {
          logoutFunction();
        }}
      />
    </div>
  );
};
export default Logout;
