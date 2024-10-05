import Image from "next/image";
import topdot from "../../public/assets/svg/frame8.svg";
import topdot2 from "../../public/assets/svg/frame9.svg";
import Typography from "../Typography";
const SectionFlex = ({ heading, subText, reverseFlex, translate, image1, image2 }) => {
    return (
        <div
            className={`mb-[-6rem] flex ${reverseFlex ? "flex-row-reverse" : "flex-row"
                } items-center justify-between px-10  mx-auto min-h-full gap-12 ${translate && translate}`}
        >
            <div className=" w-[50%]">
                <div className="relative flex-col flex ">
                    <Image src={image1} />
                    <Image
                        src={image2}
                        className="translate-x-[40%] translate-y-[-20%]"
                        width={337}
                    />
                    {!reverseFlex && (
                        <Image
                            src={topdot}
                            className="translate-x-[438%] translate-y-[-352%]"
                        />
                    )}
                    {reverseFlex && (
                        <Image
                            src={topdot2}
                            className="translate-x-[75%] translate-y-[-212%]"
                        />
                    )}
                </div>
            </div>
            <div className="w-[50%] p-10">
                <Typography textWeight="font-bold" textSize="text-[32px]">
                    {heading}
                </Typography>
                <Typography
                    textColor="dark"
                    textWeight="font-normal"
                    textSize="text-lg"
                >
                    {subText}
                </Typography>
                <button className="border-solid py-2 px-6 border-dark bg-transparent border-[1.5px] rounded-md">
                    Discover how it works
                </button>
            </div>
        </div>
    );
};

export default SectionFlex;
