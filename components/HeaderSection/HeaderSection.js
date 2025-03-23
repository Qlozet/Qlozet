import Typography from "../Typography";

const HeaderSection = ({ title, text }) => {
    return (
        <div className="w-full max-w-[1206px] flex flex-col mx-auto gap-4 my-8 px-6 lg:px-0">
            <Typography
                textWeight="font-normal"
                align={"text-center"}
                textSize="text-[48px]"
            >
                {title}
            </Typography>
            <Typography
                textWeight="font-normal"
                align={"text-center"}
                textSize="text-[24px]"
                className={"text-gray-600"}
            >
                {text}

            </Typography>
        </div>
    );
};

export default HeaderSection;
