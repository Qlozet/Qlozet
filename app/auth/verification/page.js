import Logo from "@/app/components/Logo";
import classes from "./index.module.css";
import Typography from "@/app/components/Typography";

const Verication = () => {
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      <div className={`${classes.container}  max-w-[735px] `}>
        <div className="py-16 flex justify-center">
          <Logo />
        </div>
        <div className={`${classes.sub_container} py-6 rounded-[16px] `}>
          <div className="pb-2">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[32px]"
              align="text-center"
            >
              Account created successfully
            </Typography>
          </div>
          <div className="pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[18px]"
              align="text-center"
            >
              Your Altire account has been successfully set up, and we've
              received your information. Our team will thoroughly review the
              details and documents provided. Your account verification status
              will be communicated to you via the email you provided within the
              next 48 hours.
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verication;
